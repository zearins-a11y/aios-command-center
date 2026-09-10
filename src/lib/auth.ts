/**
 * Authentication service using Supabase Auth
 * Handles login, signup, logout and OAuth
 */

import { supabase, isSupabaseConfigured } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
}

export const auth = {
  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: 'Supabase não configurado' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null, error: error.message }
    }

    return {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
        created_at: data.user.created_at,
      } : null,
      error: null,
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (
    email: string,
    password: string,
    metadata?: { full_name?: string }
  ): Promise<{ user: User | null; error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { user: null, error: 'Supabase não configurado' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      return { user: null, error: error.message }
    }

    return {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.full_name,
        avatar_url: data.user.user_metadata?.avatar_url,
        created_at: data.user.created_at,
      } : null,
      error: null,
    }
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async (): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase não configurado' }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  /**
   * Sign in with GitHub OAuth
   */
  signInWithGitHub: async (): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase não configurado' }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase não configurado' }
    }

    const { error } = await supabase.auth.signOut()
    return { error: error?.message || null }
  },

  /**
   * Get current user
   */
  getUser: async (): Promise<User | null> => {
    if (!isSupabaseConfigured || !supabase) {
      return null
    }

    const { data } = await supabase.auth.getUser()

    if (!data.user) return null

    return {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
      avatar_url: data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at,
    }
  },

  /**
   * Get current session
   */
  getSession: async () => {
    if (!isSupabaseConfigured || !supabase) {
      return null
    }

    const { data } = await supabase.auth.getSession()
    return data.session
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (user: User | null) => void) => {
    if (!isSupabaseConfigured || !supabase) {
      callback(null)
      return () => {}
    }

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
        })
      } else {
        callback(null)
      }
    })

    return () => data.subscription.unsubscribe()
  },

  /**
   * Update user metadata
   */
  updateUser: async (metadata: { full_name?: string; avatar_url?: string }): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase não configurado' }
    }

    const { error } = await supabase.auth.updateUser({
      data: metadata,
    })

    return { error: error?.message || null }
  },

  /**
   * Request password reset
   */
  resetPassword: async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase não configurado' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { error: error?.message || null }
  },

  /**
   * Update password
   */
  updatePassword: async (newPassword: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase não configurado' }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    return { error: error?.message || null }
  },
}

export default auth
