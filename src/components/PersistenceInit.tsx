import { useEffect, useState } from 'react'
import { useStrikeStore } from '../stores/useStrikeStore'
import { useAppealsStore } from '../stores/useAppealsStore'
import { useFeedbackLoopStore } from '../stores/useFeedbackLoopStore'
import { useThresholdStore } from '../stores/useThresholdStore'
import { useCouncilStore } from '../stores/useCouncilStore'
import { useEvaluationStore } from '../stores/useEvaluationStore'
import { usePublicExceptionsStore } from '../stores/usePublicExceptionsStore'
import { useHealthMetricsStore } from '../stores/useHealthMetricsStore'
import { initLocalDB } from '../lib/localStorage'

interface PersistenceInitProps {
  children: React.ReactNode
}

export function PersistenceInit({ children }: PersistenceInitProps) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize IndexedDB
        await initLocalDB()

        // Initialize all stores from local storage
        const initPromises = [
          useStrikeStore.getState().initialize?.(),
          useAppealsStore.getState().initialize?.(),
          useFeedbackLoopStore.getState().initialize?.(),
          useThresholdStore.getState().initialize?.(),
          useCouncilStore.getState().initialize?.(),
          useEvaluationStore.getState().initialize?.(),
          usePublicExceptionsStore.getState().initialize?.(),
          useHealthMetricsStore.getState().initialize?.(),
        ]

        await Promise.allSettled(initPromises)
        console.log('Local persistence initialized')
      } catch (error) {
        console.error('Failed to initialize persistence:', error)
      } finally {
        setInitialized(true)
      }
    }

    init()
  }, [])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
