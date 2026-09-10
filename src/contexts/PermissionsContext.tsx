import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  fetchPermissions,
  clearPermissionsCache,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isGestor,
  type ModuleName,
  type Permission,
  type UserPermissions,
} from '../lib/permissions'
import { auth } from '../lib/auth'

interface PermissionsContextType {
  permissions: UserPermissions | null
  loading: boolean
  initialized: boolean
  can: (module: ModuleName, permission: Permission) => boolean
  canAny: (module: ModuleName, permissions: Permission[]) => boolean
  canAll: (module: ModuleName, permissions: Permission[]) => boolean
  checkAdmin: () => boolean
  checkGestor: () => boolean
  refresh: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const loadPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const perms = await fetchPermissions()
      setPermissions(perms)
    } catch (error) {
      console.error('Failed to load permissions:', error)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [])

  // Load permissions on mount and when auth changes
  useEffect(() => {
    loadPermissions()

    // Listen for auth changes to reload permissions
    const unsubscribe = auth.onAuthStateChange(() => {
      clearPermissionsCache()
      loadPermissions()
    })

    return unsubscribe
  }, [loadPermissions])

  const can = useCallback((module: ModuleName, permission: Permission) => {
    return hasPermission(module, permission)
  }, [])

  const canAny = useCallback((module: ModuleName, perms: Permission[]) => {
    return hasAnyPermission(module, perms)
  }, [])

  const canAll = useCallback((module: ModuleName, perms: Permission[]) => {
    return hasAllPermissions(module, perms)
  }, [])

  const checkAdmin = useCallback(() => {
    return isAdmin()
  }, [])

  const checkGestor = useCallback(() => {
    return isGestor()
  }, [])

  const refresh = useCallback(async () => {
    clearPermissionsCache()
    await loadPermissions()
  }, [loadPermissions])

  const value = {
    permissions,
    loading,
    initialized,
    can,
    canAny,
    canAll,
    checkAdmin,
    checkGestor,
    refresh,
  }

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

export default PermissionsContext
