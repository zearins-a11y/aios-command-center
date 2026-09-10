// Realtime Utilities for Supabase Integration
// Provides helpers for subscribing to database changes

import { supabase, isSupabaseConfigured } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type TableName =
  | 'workspaces'
  | 'aios_queue_items'
  | 'agent_logs'
  | 'approval_items'
  | 'appeals'
  | 'strike_records'
  | 'confidence_thresholds'
  | 'feedback_signals'
  | 'council_members'
  | 'council_cases'
  | 'council_opinions'
  | 'agent_evaluations'
  | 'public_exceptions'
  | 'health_metrics'
  | 'regional_configs'

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RealtimePayload<T = any> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: Record<string, unknown>
}

/**
 * Subscribe to changes on a specific table
 */
export function subscribeToTable<T>(
  table: TableName,
  callback: (payload: RealtimePayload<T>) => void,
  event: RealtimeEvent = '*'
): RealtimeChannel | null {
  if (!isSupabaseConfigured || !supabase) return null

  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes' as const,
      {
        event: event === '*' ? 'INSERT' : event,
        schema: 'public',
        table,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => {
        callback(payload as RealtimePayload<T>)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from a realtime channel
 */
export function unsubscribe(channel: RealtimeChannel | null): void {
  if (supabase && channel) {
    supabase.removeChannel(channel)
  }
}

/**
 * Create a realtime subscription with automatic cleanup
 */
export function createSubscription<T>(
  table: TableName,
  callback: (payload: RealtimePayload<T>) => void
): () => void {
  const channel = subscribeToTable<T>(table, callback)

  // Return cleanup function
  return () => {
    unsubscribe(channel)
  }
}

/**
 * Enable realtime for a specific table
 * Note: Must be called after creating table with Supabase admin
 */
export async function enableRealtime(table: TableName): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  try {
    // This requires admin privileges, typically done via SQL migrations
    // ALTER PUBLICATION supabase_realtime ADD TABLE table_name;
    console.log(`Realtime should be enabled for ${table} via SQL migration`)
    return true
  } catch (error) {
    console.error(`Failed to enable realtime for ${table}:`, error)
    return false
  }
}

/**
 * Check if realtime is working
 */
export async function testRealtime(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false

  const supabaseClient = supabase

  return new Promise((resolve) => {
    const channel = supabaseClient.channel('test_realtime')

    channel
      .on('broadcast', { event: 'test' }, () => {
        supabaseClient.removeChannel(channel)
        resolve(true)
      })
      .subscribe((status) => {
        if (status === 'CLOSED') {
          resolve(false)
        }
      })

    // Timeout after 5 seconds
    setTimeout(() => {
      unsubscribe(channel)
      resolve(false)
    }, 5000)
  })
}
