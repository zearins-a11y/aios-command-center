/**
 * Permissions service - Check user permissions
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { auth } from './auth'

export type ModuleName = 'governance' | 'appeals' | 'strikes' | 'feedback' | 'council' | 'evaluations' | 'exceptions' | 'health' | 'regional'

export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'approve'

export interface RolePermissions {
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_approve: boolean
}

export interface UserPermissions {
  workspaceId: string | null
  projectId: string | null
  teamId: string | null
  role: string | null
  permissions: Record<ModuleName, RolePermissions>
}

let cachedPermissions: UserPermissions | null = null
let permissionsPromise: Promise<UserPermissions> | null = null

/**
 * Fetch user permissions from database
 */
export async function fetchPermissions(): Promise<UserPermissions> {
  if (!isSupabaseConfigured || !supabase) {
    return getDefaultPermissions()
  }

  const user = await auth.getUser()
  if (!user) {
    return getDefaultPermissions()
  }

  // Check cache
  if (cachedPermissions) {
    return cachedPermissions
  }

  // Prevent multiple simultaneous fetches
  if (permissionsPromise) {
    return permissionsPromise
  }

  permissionsPromise = doFetchPermissions(user.id)
  return permissionsPromise
}

async function doFetchPermissions(userId: string): Promise<UserPermissions> {
  if (!supabase) {
    return getDefaultPermissions()
  }

  try {
    // Get user's team membership with role
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select(`
        team_id,
        role_id,
        teams:team_id (
          project_id,
          projects:project_id (
            workspace_id
          )
        ),
        roles:role_id (
          name
        )
      `)
      .eq('user_id', userId)
      .single()

    if (membershipError || !membership) {
      // Check if user owns a workspace
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId)
        .single()

      if (workspace) {
        cachedPermissions = {
          workspaceId: workspace.id,
          projectId: null,
          teamId: null,
          role: 'super_admin',
          permissions: getFullPermissions(),
        }
        return cachedPermissions
      }

      return getDefaultPermissions()
    }

    const teams = membership.teams as any
    const projects = teams?.projects as any
    const workspaceId = projects?.workspace_id || null
    const projectId = teams?.project_id || null
    const teamId = membership.team_id
    const roles = membership.roles as any
    const roleName = roles?.name || 'viewer'

    // Get role permissions for all modules
    const { data: rolePermissions } = await supabase
      .from('role_permissions')
      .select('module_name, can_view, can_create, can_edit, can_delete, can_approve')
      .eq('role_id', membership.role_id)

    // Build permissions map
    const permissions: Record<ModuleName, RolePermissions> = {
      governance: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      appeals: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      strikes: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      feedback: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      council: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      evaluations: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      exceptions: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      health: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      regional: { can_view: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    }

    rolePermissions?.forEach((rp) => {
      const module = rp.module_name as ModuleName
      if (module && permissions[module]) {
        permissions[module] = {
          can_view: rp.can_view,
          can_create: rp.can_create,
          can_edit: rp.can_edit,
          can_delete: rp.can_delete,
          can_approve: rp.can_approve,
        }
      }
    })

    cachedPermissions = {
      workspaceId,
      projectId,
      teamId,
      role: roleName,
      permissions,
    }

    return cachedPermissions
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
    return getDefaultPermissions()
  } finally {
    permissionsPromise = null
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(module: ModuleName, permission: Permission): boolean {
  if (!cachedPermissions) return false

  const modulePerms = cachedPermissions.permissions[module]
  if (!modulePerms) return false

  switch (permission) {
    case 'view':
      return modulePerms.can_view
    case 'create':
      return modulePerms.can_create
    case 'edit':
      return modulePerms.can_edit
    case 'delete':
      return modulePerms.can_delete
    case 'approve':
      return modulePerms.can_approve
    default:
      return false
  }
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(module: ModuleName, perms: Permission[]): boolean {
  return perms.some((p) => hasPermission(module, p))
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(module: ModuleName, perms: Permission[]): boolean {
  return perms.every((p) => hasPermission(module, p))
}

/**
 * Check if user is admin or higher
 */
export function isAdmin(): boolean {
  if (!cachedPermissions) return false
  return ['super_admin', 'admin', 'gestor'].includes(cachedPermissions.role || '')
}

/**
 * Check if user is gestor or higher
 */
export function isGestor(): boolean {
  if (!cachedPermissions) return false
  return ['super_admin', 'admin', 'gestor'].includes(cachedPermissions.role || '')
}

/**
 * Get current user permissions
 */
export function getCurrentPermissions(): UserPermissions | null {
  return cachedPermissions
}

/**
 * Clear cached permissions
 */
export function clearPermissionsCache(): void {
  cachedPermissions = null
}

/**
 * Get default permissions (no access)
 */
function getDefaultPermissions(): UserPermissions {
  const emptyModulePerms: RolePermissions = {
    can_view: false,
    can_create: false,
    can_edit: false,
    can_delete: false,
    can_approve: false,
  }

  return {
    workspaceId: null,
    projectId: null,
    teamId: null,
    role: null,
    permissions: {
      governance: { ...emptyModulePerms },
      appeals: { ...emptyModulePerms },
      strikes: { ...emptyModulePerms },
      feedback: { ...emptyModulePerms },
      council: { ...emptyModulePerms },
      evaluations: { ...emptyModulePerms },
      exceptions: { ...emptyModulePerms },
      health: { ...emptyModulePerms },
      regional: { ...emptyModulePerms },
    },
  }
}

/**
 * Get full permissions (for super_admin)
 */
function getFullPermissions(): Record<ModuleName, RolePermissions> {
  const fullModulePerms: RolePermissions = {
    can_view: true,
    can_create: true,
    can_edit: true,
    can_delete: true,
    can_approve: true,
  }

  return {
    governance: { ...fullModulePerms },
    appeals: { ...fullModulePerms },
    strikes: { ...fullModulePerms },
    feedback: { ...fullModulePerms },
    council: { ...fullModulePerms },
    evaluations: { ...fullModulePerms },
    exceptions: { ...fullModulePerms },
    health: { ...fullModulePerms },
    regional: { ...fullModulePerms },
  }
}
