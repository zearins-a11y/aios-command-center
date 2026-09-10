import { useState, useEffect } from 'react'
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { syncManager, SyncState, SyncDirection } from '../lib/syncManager'

interface SyncButtonProps {
  direction?: SyncDirection
  showStatus?: boolean
  compact?: boolean
}

export function SyncButton({ direction = 'local-to-cloud', showStatus = true, compact = false }: SyncButtonProps) {
  const [state, setState] = useState<SyncState>(syncManager.getState())
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    return syncManager.subscribe(setState)
  }, [])

  const handleSync = async () => {
    if (isSyncing || !state.isOnline) return

    setIsSyncing(true)
    setLastResult(null)

    let result
    switch (direction) {
      case 'local-to-cloud':
        result = await syncManager.syncToCloud()
        break
      case 'cloud-to-local':
        result = await syncManager.syncFromCloud()
        break
      case 'both':
        result = await syncManager.syncBoth()
        break
    }

    setIsSyncing(false)
    setLastResult({
      success: result.success,
      message: result.success
        ? `Sincronizados ${result.itemsSynced} itens`
        : result.errors[0] || 'Erro na sincronização',
    })

    // Clear message after 3 seconds
    setTimeout(() => setLastResult(null), 3000)
  }

  const getStatusColor = () => {
    if (!state.isOnline) return 'text-gray-400'
    if (state.status === 'syncing') return 'text-blue-500'
    if (state.status === 'error') return 'text-red-500'
    if (state.status === 'success') return 'text-green-500'
    return 'text-gray-400'
  }

  const getStatusIcon = () => {
    if (!state.isOnline) return <WifiOff className="w-4 h-4" />
    if (state.status === 'syncing') return <RefreshCw className="w-4 h-4 animate-spin" />
    if (state.status === 'error') return <AlertCircle className="w-4 h-4" />
    if (state.status === 'success') return <Check className="w-4 h-4" />
    return <Wifi className="w-4 h-4" />
  }

  const getButtonIcon = () => {
    if (!state.isOnline) return <CloudOff className="w-4 h-4" />
    return <Cloud className={`w-4 h-4 ${state.status === 'syncing' ? 'animate-pulse' : ''}`} />
  }

  const getDirectionLabel = () => {
    switch (direction) {
      case 'local-to-cloud':
        return 'Subir'
      case 'cloud-to-local':
        return 'Baixar'
      case 'both':
        return 'Sync'
    }
  }

  const formatLastSync = () => {
    if (!state.lastSync) return 'Nunca sincronizado'
    const diff = Date.now() - new Date(state.lastSync).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    return state.lastSync.toLocaleDateString()
  }

  if (compact) {
    return (
      <button
        onClick={handleSync}
        disabled={!state.isOnline || isSyncing}
        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor()} hover:bg-gray-100 dark:hover:bg-gray-800`}
        title={state.isOnline ? `${getDirectionLabel()} para ${direction === 'local-to-cloud' ? 'cloud' : 'local'}` : 'Offline'}
      >
        {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : getButtonIcon()}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSync}
          disabled={!state.isOnline || isSyncing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            state.isOnline
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
          }`}
        >
          {getButtonIcon()}
          <span>{isSyncing ? 'Sincronizando...' : getDirectionLabel()}</span>
        </button>

        {showStatus && (
          <div className={`flex items-center gap-1.5 text-sm ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{state.isOnline ? 'Online' : 'Offline'}</span>
          </div>
        )}
      </div>

      {showStatus && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Última sync: {formatLastSync()}</span>
          {lastResult && (
            <span className={lastResult.success ? 'text-green-600' : 'text-red-600'}>
              {lastResult.message}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Sync status indicator (small dot)
export function SyncStatusDot() {
  const [state, setState] = useState<SyncState>(syncManager.getState())

  useEffect(() => {
    return syncManager.subscribe(setState)
  }, [])

  const getColor = () => {
    if (!state.isOnline) return 'bg-gray-400'
    if (state.status === 'syncing') return 'bg-blue-500 animate-pulse'
    if (state.status === 'error') return 'bg-red-500'
    if (state.status === 'success') return 'bg-green-500'
    return 'bg-gray-400'
  }

  return <div className={`w-2 h-2 rounded-full ${getColor()}`} />
}

// Sync modal/panel
export function SyncPanel() {
  const [state, setState] = useState<SyncState>(syncManager.getState())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    return syncManager.subscribe(setState)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <SyncStatusDot />
        <span className="text-sm font-medium">Sync</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <h3 className="font-semibold mb-4">Sincronização</h3>

            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className={`flex items-center gap-1.5 ${state.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                  {state.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span className="text-sm">{state.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>

              {/* Last sync */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Última sync</span>
                <span className="text-sm">
                  {state.lastSync ? state.lastSync.toLocaleString() : 'Nunca'}
                </span>
              </div>

              {/* Error */}
              {state.error && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {state.error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => syncManager.syncFromCloud()}
                  disabled={!state.isOnline}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Cloud className="w-4 h-4 mx-auto mb-1" />
                  Baixar
                </button>
                <button
                  onClick={() => syncManager.syncToCloud()}
                  disabled={!state.isOnline}
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Cloud className="w-4 h-4 mx-auto mb-1" />
                  Subir
                </button>
              </div>

              <button
                onClick={() => syncManager.syncBoth()}
                disabled={!state.isOnline}
                className="w-full px-3 py-2 text-sm bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sync Bidirecional
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
