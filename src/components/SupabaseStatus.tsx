// Supabase Connection Status Component
// Shows connection status and provides quick actions

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, ExternalLink } from 'lucide-react'
import { isSupabaseConfigured, checkConnection } from '../lib/supabase'
import { testRealtime } from '../lib/realtime'

interface ConnectionStatusProps {
  onConnect?: () => void
  onDisconnect?: () => void
}

export function ConnectionStatus({ onConnect, onDisconnect }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    if (!isSupabaseConfigured) {
      setIsConnected(false)
      setIsRealtimeEnabled(false)
      return
    }

    setIsChecking(true)
    try {
      const connected = await checkConnection()
      setIsConnected(connected)

      if (connected) {
        const realtime = await testRealtime()
        setIsRealtimeEnabled(realtime)
      } else {
        setIsRealtimeEnabled(false)
      }
    } catch {
      setIsConnected(false)
      setIsRealtimeEnabled(false)
    } finally {
      setIsChecking(false)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <WifiOff className="w-4 h-4 text-amber-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-500">Supabase não configurado</p>
          <p className="text-xs text-amber-500/70">
            Configure as variáveis de ambiente para conectar
          </p>
        </div>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-amber-500/20 transition-colors"
          title="Abrir Supabase"
        >
          <ExternalLink className="w-4 h-4 text-amber-500" />
        </a>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
        isConnected
          ? 'bg-emerald-500/10 border-emerald-500/20'
          : 'bg-red-500/10 border-red-500/20'
      }`}
    >
      {isConnected ? (
        <Wifi className="w-4 h-4 text-emerald-500" />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}

      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            isConnected ? 'text-emerald-500' : 'text-red-500'
          }`}
        >
          {isConnected ? 'Supabase conectado' : 'Supabase desconectado'}
        </p>
        {isConnected && (
          <p className="text-xs text-emerald-500/70">
            Realtime: {isRealtimeEnabled ? 'ativo' : 'inativo'}
          </p>
        )}
      </div>

      <button
        onClick={checkStatus}
        disabled={isChecking}
        className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
          isChecking ? 'animate-spin' : ''
        }`}
        title="Verificar conexão"
      >
        <RefreshCw className="w-4 h-4 text-white/60" />
      </button>

      {isConnected ? (
        <button
          onClick={onDisconnect}
          className="px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
        >
          Desconectar
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="px-2 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
        >
          Conectar
        </button>
      )}
    </div>
  )
}

// Hook to use Supabase connection status
export function useSupabaseConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const check = async () => {
    if (!isSupabaseConfigured) {
      setIsConnected(false)
      setIsRealtimeEnabled(false)
      return
    }

    setIsChecking(true)
    try {
      const connected = await checkConnection()
      setIsConnected(connected)

      if (connected) {
        const realtime = await testRealtime()
        setIsRealtimeEnabled(realtime)
      }
    } catch {
      setIsConnected(false)
      setIsRealtimeEnabled(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    check()
  }, [])

  return {
    isConfigured: isSupabaseConfigured,
    isConnected,
    isRealtimeEnabled,
    isChecking,
    check,
  }
}
