import { useState, useEffect } from 'react'
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { syncManager, SyncState, SyncDirection, SyncConflict } from '../lib/syncManager'

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
    if (state.status === 'conflicts') return 'text-yellow-500'
    if (state.status === 'success') return 'text-green-500'
    return 'text-gray-400'
  }

  const getStatusIcon = () => {
    if (!state.isOnline) return <WifiOff className="w-4 h-4" />
    if (state.status === 'syncing') return <RefreshCw className="w-4 h-4 animate-spin" />
    if (state.status === 'error') return <AlertCircle className="w-4 h-4" />
    if (state.status === 'conflicts') return <AlertTriangle className="w-4 h-4" />
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
    if (state.status === 'conflicts') return 'bg-yellow-500 animate-pulse'
    if (state.status === 'success') return 'bg-green-500'
    return 'bg-gray-400'
  }

  return <div className={`w-2 h-2 rounded-full ${getColor()}`} />
}

// Conflict resolution modal
export function ConflictModal() {
  const [state, setState] = useState<SyncState>(syncManager.getState())
  const [selectedConflict, setSelectedConflict] = useState<SyncConflict | null>(null)

  useEffect(() => {
    return syncManager.subscribe(setState)
  }, [])

  useEffect(() => {
    if (state.pendingConflicts.length > 0 && !selectedConflict) {
      setSelectedConflict(state.pendingConflicts[0])
    }
  }, [state.pendingConflicts])

  if (state.pendingConflicts.length === 0) return null

  const conflict = selectedConflict || state.pendingConflicts[0]
  if (!conflict) return null

  const handleResolve = async (resolution: 'local' | 'cloud') => {
    await syncManager.resolveConflict(conflict.id, resolution)
    setSelectedConflict(state.pendingConflicts[0] || null)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold">Conflitos de Sincronização</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Foram detectados {state.pendingConflicts.length} conflito(s). Escolha qual versão manter:
        </p>

        {/* Conflict list */}
        <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
          {state.pendingConflicts.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedConflict(c)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                selectedConflict?.id === c.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm">
                {c.table} • {c.id}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Local: {formatDate(c.localUpdatedAt)} • Cloud: {formatDate(c.cloudUpdatedAt)}
              </div>
            </button>
          ))}
        </div>

        {/* Conflict details */}
        {conflict && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-2">Detalhes do Conflito</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Versão Local</div>
                <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-32 overflow-auto">
                  {JSON.stringify(conflict.localItem, null, 2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Atualizado: {formatDate(conflict.localUpdatedAt)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Versão Cloud</div>
                <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-32 overflow-auto">
                  {JSON.stringify(conflict.cloudItem, null, 2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Atualizado: {formatDate(conflict.cloudUpdatedAt)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => handleResolve('local')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manter Local
          </button>
          <button
            onClick={() => handleResolve('cloud')}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Manter Cloud
          </button>
          <button
            onClick={() => syncManager.resolveAllConflicts('local')}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Manter todos locais
          </button>
        </div>

        {state.pendingConflicts.length > 1 && (
          <button
            onClick={() => syncManager.resolveAllConflicts('cloud')}
            className="w-full mt-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Manter todos do cloud
          </button>
        )}
      </div>
    </div>
  )
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
