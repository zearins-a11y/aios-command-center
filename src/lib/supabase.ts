// Supabase Client Configuration
// Docs: https://supabase.com/docs/reference/javascript/initializing

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create client with fallback for development (no Supabase configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

// Helper to check connection status
export const checkConnection = async (): Promise<boolean> => {
  if (!supabase) return false
  try {
    const { error } = await supabase.from('approvals').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

// Database types are in lib/types.ts
export type { Database } from './types'
