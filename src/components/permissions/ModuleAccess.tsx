import React from 'react'
import { usePermissions } from '../../contexts/PermissionsContext'
import type { ModuleName, Permission } from '../../lib/permissions'
import { Loader2 } from 'lucide-react'

interface ModuleAccessProps {
  module: ModuleName
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  showLoader?: boolean
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function ModuleAccess({
  module,
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  showLoader = false,
}: ModuleAccessProps) {
  const { can, canAny, canAll, loading } = usePermissions()

  // Show loader while checking permissions
  if (loading && showLoader) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    )
  }

  // Determine if access is granted
  let hasAccess = false

  if (permission) {
    // Single permission check
    hasAccess = can(module, permission)
  } else if (permissions) {
    // Multiple permissions check
    hasAccess = requireAll ? canAll(module, permissions) : canAny(module, permissions)
  } else {
    // Just check if user can view
    hasAccess = can(module, 'view')
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * HOC version for wrapping components
 */
export function withModuleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    module: ModuleName
    permission?: Permission
    permissions?: Permission[]
    requireAll?: boolean
  }
) {
  return function WithModuleAccessComponent(props: P) {
    return (
      <ModuleAccess {...options}>
        <WrappedComponent {...props} />
      </ModuleAccess>
    )
  }
}
