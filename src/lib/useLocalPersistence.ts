/**
 * Hook para sincronizar dados do store com IndexedDB local
 * Para ser usado em conjunto com syncManager
 */

import { useEffect, useRef } from 'react'
import { initLocalDB, setLocalData, STORES } from './localStorage'

// Mapeamento de stores para nomes de collection no IndexedDB
export const STORE_NAMES: Record<string, string> = {
  strikes: STORES.STRIKES,
  appeals: STORES.APPEALS,
  feedback: STORES.FEEDBACK,
  councilMembers: STORES.COUNCIL_MEMBERS,
  councilCases: STORES.COUNCIL_CASES,
  evaluations: STORES.EVALUATIONS,
  thresholds: STORES.THRESHOLDS,
  exceptions: STORES.EXCEPTIONS,
  health: STORES.HEALTH,
  approvals: 'approvals', // Não existe ainda no STORES, mas podemos adicionar
}

/**
 * Hook que persiste automaticamente os dados de um store no IndexedDB
 * @param storeKey - Nome único do store (usado como chave no IndexedDB)
 * @param getData - Função que retorna os dados atuais do store
 * @param debounceMs - Ms para esperar antes de salvar (evita múltiplas escritas)
 */
export function useLocalPersistence<T>(
  storeKey: string,
  getData: () => T,
  debounceMs = 500
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastDataRef = useRef<string>('')

  useEffect(() => {
    // Inicializa o DB
    initLocalDB().catch(console.error)
  }, [])

  useEffect(() => {
    const data = getData()
    const dataString = JSON.stringify(data)

    // Só salva se mudou
    if (dataString === lastDataRef.current) return

    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Agenda novo save com debounce
    timeoutRef.current = setTimeout(async () => {
      try {
        const storeName = STORE_NAMES[storeKey] || storeKey
        await setLocalData(storeName, Array.isArray(data) ? data : [data])
        lastDataRef.current = dataString
      } catch (error) {
        console.error(`Failed to persist ${storeKey} to IndexedDB:`, error)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [storeKey, getData, debounceMs])
}

/**
 * Carrega dados do IndexedDB para um store
 */
export async function loadFromLocal<T>(storeKey: string): Promise<T[]> {
  try {
    const storeName = STORE_NAMES[storeKey] || storeKey
    const { getLocalData } = await import('./localStorage')
    return await getLocalData<T>(storeName)
  } catch (error) {
    console.error(`Failed to load ${storeKey} from IndexedDB:`, error)
    return []
  }
}

/**
 * Salva dados de um store no IndexedDB
 */
export async function saveToLocal<T extends { id: string }>(
  storeKey: string,
  data: T[]
): Promise<void> {
  try {
    const storeName = STORE_NAMES[storeKey] || storeKey
    const { setLocalData } = await import('./localStorage')
    await setLocalData(storeName, data)
  } catch (error) {
    console.error(`Failed to save ${storeKey} to IndexedDB:`, error)
  }
}
