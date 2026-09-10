/**
 * Sync Manager - Coordena sincronização bidirecional
 * entre IndexedDB local e Supabase cloud
 */

import { supabase, isSupabaseConfigured, checkConnection } from './supabase'
import {
  initLocalDB,
  getLocalData,
  setLocalData,
  getLastSyncTime,
  setLastSyncTime,
  STORES,
} from './localStorage'

export type SyncDirection = 'local-to-cloud' | 'cloud-to-local' | 'both'
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export interface SyncResult {
  success: boolean
  direction: SyncDirection
  timestamp: Date
  itemsSynced: number
  errors: string[]
}

export interface SyncState {
  status: SyncStatus
  lastSync: Date | null
  isOnline: boolean
  error: string | null
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

class SyncManager {
  private listeners: Set<(state: SyncState) => void> = new Set()
  private state: SyncState = {
    status: 'idle',
    lastSync: null,
    isOnline: navigator.onLine,
    error: null,
  }

  constructor() {
    // Listen for online/offline events
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
    listener(this.state) // Initial call
    return () => this.listeners.delete(listener)
  }

  getState(): SyncState {
    return { ...this.state }
  }

  async isCloudAvailable(): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    return checkConnection()
  }

  async syncToCloud(): Promise<SyncResult> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        direction: 'local-to-cloud',
        timestamp: new Date(),
        itemsSynced: 0,
        errors: ['Supabase não configurado'],
      }
    }

    this.state.status = 'syncing'
    this.state.error = null
    this.notifyListeners()

    const errors: string[] = []
    let itemsSynced = 0

    try {
      await initLocalDB()

      for (const [localStore, cloudTable] of Object.entries(STORE_TO_TABLE_MAP)) {
        try {
          const localData = await getLocalData<any>(localStore)

          if (localData.length > 0) {
            const { error } = await supabase.from(cloudTable).upsert(localData)

            if (error) {
              errors.push(`${cloudTable}: ${error.message}`)
            } else {
              itemsSynced += localData.length
            }
          }
        } catch (err: any) {
          errors.push(`${localStore}: ${err.message}`)
        }
      }

      if (errors.length === 0) {
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
      success: errors.length === 0,
      direction: 'local-to-cloud',
      timestamp: new Date(),
      itemsSynced,
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
        errors: ['Supabase não configurado'],
      }
    }

    this.state.status = 'syncing'
    this.state.error = null
    this.notifyListeners()

    const errors: string[] = []
    let itemsSynced = 0

    try {
      await initLocalDB()

      for (const [localStore, cloudTable] of Object.entries(STORE_TO_TABLE_MAP)) {
        try {
          const { data, error } = await supabase.from(cloudTable).select('*')

          if (error) {
            errors.push(`${cloudTable}: ${error.message}`)
          } else if (data && data.length > 0) {
            await setLocalData(localStore, data)
            itemsSynced += data.length
          }
        } catch (err: any) {
          errors.push(`${localStore}: ${err.message}`)
        }
      }

      if (errors.length === 0) {
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
      success: errors.length === 0,
      direction: 'cloud-to-local',
      timestamp: new Date(),
      itemsSynced,
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
