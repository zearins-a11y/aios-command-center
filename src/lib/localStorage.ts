/**
 * Local Storage Manager using IndexedDB
 * Provides offline-first storage that syncs with Supabase
 */

const DB_NAME = 'aios-command-center'
const DB_VERSION = 1
const STORES = {
  STRIKES: 'strikes',
  APPEALS: 'appeals',
  FEEDBACK: 'feedback',
  COUNCIL_MEMBERS: 'council_members',
  COUNCIL_CASES: 'council_cases',
  EVALUATIONS: 'evaluations',
  THRESHOLDS: 'thresholds',
  EXCEPTIONS: 'exceptions',
  HEALTH: 'health',
  APPROVALS: 'approvals',
  META: 'meta', // sync timestamps, etc.
}

let db: IDBDatabase | null = null

export async function initLocalDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create stores
      Object.values(STORES).forEach((storeName) => {
        if (!database.objectStoreNames.contains(storeName)) {
          database.createObjectStore(storeName, { keyPath: 'id' })
        }
      })
    }
  })
}

export async function getLocalData<T>(storeName: string): Promise<T[]> {
  const database = await initLocalDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

export async function setLocalData<T extends { id: string }>(
  storeName: string,
  data: T[]
): Promise<void> {
  const database = await initLocalDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)

    // Clear existing
    store.clear()

    // Add all items
    data.forEach((item) => {
      store.add(item)
    })

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function updateLocalItem<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<void> {
  const database = await initLocalDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    store.put(item)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function deleteLocalItem(
  storeName: string,
  id: string
): Promise<void> {
  const database = await initLocalDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    store.delete(id)

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// Meta operations for sync tracking
export async function getLastSyncTime(): Promise<Date | null> {
  const data = await getLocalData<{ key: string; value: string }>(STORES.META)
  const syncEntry = data.find((d) => d.key === 'lastSync')
  return syncEntry ? new Date(syncEntry.value) : null
}

export async function setLastSyncTime(date: Date): Promise<void> {
  await updateLocalItem(STORES.META, {
    id: 'lastSync',
    key: 'lastSync',
    value: date.toISOString(),
  })
}

// Clear all local data
export async function clearLocalData(): Promise<void> {
  const database = await initLocalDB()
  const transaction = database.transaction(
    Object.values(STORES),
    'readwrite'
  )

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)

    Object.values(STORES).forEach((storeName) => {
      transaction.objectStore(storeName).clear()
    })
  })
}

export { STORES }
