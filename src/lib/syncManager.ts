/**
 * Sync Manager - Coordena sincronização bidirecional
 * entre IndexedDB local e Supabase cloud com resolução de conflitos
 */

import { supabase, isSupabaseConfigured } from './supabase'
import {
  initLocalDB,
  getLocalData,
  setLocalData,
  getLastSyncTime,
  setLastSyncTime,
  STORES,
} from './localStorage'

export type SyncDirection = 'local-to-cloud' | 'cloud-to-local' | 'both'
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflicts'

export interface SyncConflict {
  id: string
  store: string
  table: string
  localItem: any
  cloudItem: any
  localUpdatedAt: Date
  cloudUpdatedAt: Date
  resolved?: 'local' | 'cloud' | 'merged'
}

export interface SyncResult {
  success: boolean
  direction: SyncDirection
  timestamp: Date
  itemsSynced: number
  conflicts: SyncConflict[]
  errors: string[]
}

export interface SyncState {
  status: SyncStatus
  lastSync: Date | null
  isOnline: boolean
  error: string | null
  pendingConflicts: SyncConflict[]
}

// Store mapping: local store name -> Supabase table name
const STORE_TO_TABLE_MAP: Record<string, string> = {
  [STORES.STRIKES]: 'strike_records',
  [STORES.APPEALS]: 'appeals',
  [STORES.FEEDBACK]: 'feedback_signals',
  [STORES.COUNCIL_MEMBERS]: 'council_members',
  [STORES.COUNCIL_CASES]: 'council_cases',
  [STORES.EVALUATIONS]: 'agent_evaluations',
  [STORES.THRESHOLDS]: 'confidence_thresholds',
  [STORES.EXCEPTIONS]: 'public_exceptions',
  [STORES.HEALTH]: 'health_metrics',
  [STORES.APPROVALS]: 'approvals',
}

// Timestamp field mapping per table
const TIMESTAMP_FIELDS: Record<string, { updatedAt: string; createdAt: string }> = {
  strike_records: { updatedAt: 'timestamp', createdAt: 'timestamp' },
  appeals: { updatedAt: 'submitted_at', createdAt: 'submitted_at' },
  feedback_signals: { updatedAt: 'created_at', createdAt: 'created_at' },
  council_members: { updatedAt: 'joined_at', createdAt: 'joined_at' },
  council_cases: { updatedAt: 'created_at', createdAt: 'created_at' },
  agent_evaluations: { updatedAt: 'evaluated_at', createdAt: 'evaluated_at' },
  confidence_thresholds: { updatedAt: 'created_at', createdAt: 'created_at' },
  public_exceptions: { updatedAt: 'requested_at', createdAt: 'requested_at' },
  health_metrics: { updatedAt: 'date', createdAt: 'date' },
  approvals: { updatedAt: 'created_at', createdAt: 'created_at' },
}

class SyncManager {
  private listeners: Set<(state: SyncState) => void> = new Set()
  private state: SyncState = {
    status: 'idle',
    lastSync: null,
    isOnline: navigator.onLine,
    error: null,
    pendingConflicts: [],
  }

  constructor() {
    window.addEventListener('online', () => this.updateOnlineStatus(true))
    window.addEventListener('offline', () => this.updateOnlineStatus(false))
  }

  private updateOnlineStatus(isOnline: boolean) {
    this.state.isOnline = isOnline
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  getState(): SyncState {
    return { ...this.state }
  }

  getConflicts(): SyncConflict[] {
    return this.state.pendingConflicts
  }

  async resolveConflict(conflictId: string, resolution: 'local' | 'cloud'): Promise<void> {
    const conflict = this.state.pendingConflicts.find(c => c.id === conflictId)
    if (!conflict) return

    if (resolution === 'local') {
      // Subir versão local para cloud
      await supabase?.from(conflict.table).upsert({
        ...conflict.localItem,
        [TIMESTAMP_FIELDS[conflict.table].updatedAt]: new Date().toISOString(),
      })
    } else {
      // Sobrescrever local com versão do cloud
      await setLocalData(conflict.store, [conflict.cloudItem])
    }

    // Remover conflito da lista
    this.state.pendingConflicts = this.state.pendingConflicts.filter(c => c.id !== conflictId)

    if (this.state.pendingConflicts.length === 0) {
      this.state.status = 'idle'
    }

    this.notifyListeners()
  }

  async resolveAllConflicts(resolution: 'local' | 'cloud'): Promise<void> {
    for (const conflict of this.state.pendingConflicts) {
      await this.resolveConflict(conflict.id, resolution)
    }
  }

  private getTimestamp(item: any, table: string): Date {
    const field = TIMESTAMP_FIELDS[table]?.updatedAt || 'updated_at'
    const value = item[field]
    return value ? new Date(value) : new Date(0)
  }

  private setTimestamp(item: any, table: string, date: Date): any {
    const field = TIMESTAMP_FIELDS[table]?.updatedAt || 'updated_at'
    return { ...item, [field]: date.toISOString() }
  }

  async syncToCloud(): Promise<SyncResult> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        direction: 'local-to-cloud',
        timestamp: new Date(),
        itemsSynced: 0,
        conflicts: [],
        errors: ['Supabase não configurado'],
      }
    }

    this.state.status = 'syncing'
    this.state.error = null
    this.notifyListeners()

    const errors: string[] = []
    const conflicts: SyncConflict[] = []
    let itemsSynced = 0

    try {
      await initLocalDB()

      for (const [localStore, cloudTable] of Object.entries(STORE_TO_TABLE_MAP)) {
        try {
          const localData = await getLocalData<any>(localStore)

          for (const localItem of localData) {
            const localUpdatedAt = this.getTimestamp(localItem, cloudTable)

            // Verificar se existe no cloud
            const { data: cloudItem, error } = await supabase
              .from(cloudTable)
              .select('*')
              .eq('id', localItem.id)
              .single()

            if (error && error.code !== 'PGRST116') {
              // Erro diferente de "não encontrado"
              errors.push(`${cloudTable}: ${error.message}`)
              continue
            }

            if (cloudItem) {
              const cloudUpdatedAt = this.getTimestamp(cloudItem, cloudTable)

              // Conflito: cloud é mais novo
              if (cloudUpdatedAt > localUpdatedAt) {
                conflicts.push({
                  id: `${cloudTable}-${localItem.id}`,
                  store: localStore,
                  table: cloudTable,
                  localItem,
                  cloudItem,
                  localUpdatedAt,
                  cloudUpdatedAt,
                })
                continue
              }
            }

            // Local é mais novo ou não existe no cloud - subir
            const itemToUpsert = this.setTimestamp(localItem, cloudTable, new Date())
            const { error: upsertError } = await supabase
              .from(cloudTable)
              .upsert(itemToUpsert)

            if (upsertError) {
              errors.push(`${cloudTable}: ${upsertError.message}`)
            } else {
              itemsSynced++
            }
          }
        } catch (err: any) {
          errors.push(`${localStore}: ${err.message}`)
        }
      }

      // Atualizar estado
      if (conflicts.length > 0) {
        this.state.pendingConflicts = [...this.state.pendingConflicts, ...conflicts]
        this.state.status = 'conflicts'
      } else if (errors.length === 0) {
        await setLastSyncTime(new Date())
        this.state.lastSync = new Date()
        this.state.status = 'success'
      } else {
        this.state.status = 'error'
        this.state.error = errors.join('; ')
      }
    } catch (err: any) {
      this.state.status = 'error'
      this.state.error = err.message
      errors.push(err.message)
    }

    this.notifyListeners()

    return {
      success: errors.length === 0 && conflicts.length === 0,
      direction: 'local-to-cloud',
      timestamp: new Date(),
      itemsSynced,
      conflicts,
      errors,
    }
  }

  async syncFromCloud(): Promise<SyncResult> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        direction: 'cloud-to-local',
        timestamp: new Date(),
        itemsSynced: 0,
        conflicts: [],
        errors: ['Supabase não configurado'],
      }
    }

    this.state.status = 'syncing'
    this.state.error = null
    this.notifyListeners()

    const errors: string[] = []
    const conflicts: SyncConflict[] = []
    let itemsSynced = 0

    try {
      await initLocalDB()

      for (const [localStore, cloudTable] of Object.entries(STORE_TO_TABLE_MAP)) {
        try {
          const { data: cloudData, error } = await supabase.from(cloudTable).select('*')

          if (error) {
            errors.push(`${cloudTable}: ${error.message}`)
            continue
          }

          if (cloudData && cloudData.length > 0) {
            const localData = await getLocalData<any>(localStore)

            for (const cloudItem of cloudData) {
              const cloudUpdatedAt = this.getTimestamp(cloudItem, cloudTable)

              // Verificar se existe localmente
              const localItem = localData.find((l: any) => l.id === cloudItem.id)

              if (localItem) {
                const localUpdatedAt = this.getTimestamp(localItem, cloudTable)

                // Conflito: local é mais novo
                if (localUpdatedAt > cloudUpdatedAt) {
                  conflicts.push({
                    id: `${cloudTable}-${cloudItem.id}`,
                    store: localStore,
                    table: cloudTable,
                    localItem,
                    cloudItem,
                    localUpdatedAt,
                    cloudUpdatedAt,
                  })
                  continue
                }
              }

              // Cloud é mais novo ou não existe local - baixar
              const itemToSave = this.setTimestamp(cloudItem, cloudTable, cloudUpdatedAt)
              await setLocalData(localStore, [...localData.filter((l: any) => l.id !== cloudItem.id), itemToSave])
              itemsSynced++
            }
          }
        } catch (err: any) {
          errors.push(`${localStore}: ${err.message}`)
        }
      }

      if (conflicts.length > 0) {
        this.state.pendingConflicts = [...this.state.pendingConflicts, ...conflicts]
        this.state.status = 'conflicts'
      } else if (errors.length === 0) {
        await setLastSyncTime(new Date())
        this.state.lastSync = new Date()
        this.state.status = 'success'
      } else {
        this.state.status = 'error'
        this.state.error = errors.join('; ')
      }
    } catch (err: any) {
      this.state.status = 'error'
      this.state.error = err.message
      errors.push(err.message)
    }

    this.notifyListeners()

    return {
      success: errors.length === 0 && conflicts.length === 0,
      direction: 'cloud-to-local',
      timestamp: new Date(),
      itemsSynced,
      conflicts,
      errors,
    }
  }

  async syncBoth(): Promise<SyncResult> {
    // Primeiro baixa do cloud, depois sobe o local
    const fromCloud = await this.syncFromCloud()

    if (!fromCloud.success) {
      return fromCloud
    }

    return this.syncToCloud()
  }

  async checkLastSync(): Promise<Date | null> {
    return getLastSyncTime()
  }
}

// Singleton
export const syncManager = new SyncManager()
