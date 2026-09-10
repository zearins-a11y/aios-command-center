import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth, User } from '../lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithGitHub: () => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  updateUser: (metadata: { full_name?: string }) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await auth.getUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Failed to get current user:', error)
      } finally {
        setInitialized(true)
      }
    }

    initAuth()

    // Listen for auth changes
    const unsubscribe = auth.onAuthStateChange((user) => {
      setUser(user)
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await auth.signIn(email, password)
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true)
    try {
      const { error } = await auth.signUp(email, password, { full_name: name })
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await auth.signInWithGoogle()
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGitHub = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await auth.signInWithGitHub()
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await auth.signOut()
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (metadata: { full_name?: string }) => {
    setLoading(true)
    try {
      const { error } = await auth.updateUser(metadata)
      if (!error) {
        setUser((prev) => prev ? { ...prev, ...metadata } : null)
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    initialized,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
