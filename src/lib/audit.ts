/**
 * Audit service - Log and retrieve audit events
 */

import { supabase, isSupabaseConfigured } from './supabase'

export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'view'

export interface AuditLog {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  team_id: string | null
  action: AuditAction
  module_name: string
  resource_type: string
  resource_id: string | null
  old_value: Record<string, any> | null
  new_value: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface CreateAuditLogParams {
  action: AuditAction
  module: string
  resourceType: string
  resourceId?: string
  oldValue?: Record<string, any>
  newValue?: Record<string, any>
}

export interface AuditFilters {
  module?: string
  action?: AuditAction
  userId?: string
  teamId?: string
  resourceType?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
}

/**
 * Log an audit event
 */
export async function logAudit(params: CreateAuditLogParams): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Audit]', params.action, params.module, params.resourceType, params.resourceId)
    return
  }

  try {
    await supabase.rpc('create_audit_log', {
      p_action: params.action,
      p_module: params.module,
      p_resource_type: params.resourceType,
      p_resource_id: params.resourceId || null,
      p_old_value: params.oldValue || null,
      p_new_value: params.newValue || null,
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: AuditFilters = {}): Promise<AuditLog[]> {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      user_profiles:user_id (full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (filters.module) {
    query = query.eq('module_name', filters.module)
  }

  if (filters.action) {
    query = query.eq('action', filters.action)
  }

  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters.teamId) {
    query = query.eq('team_id', filters.teamId)
  }

  if (filters.resourceType) {
    query = query.eq('resource_type', filters.resourceType)
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString())
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString())
  }

  const { data, error } = await query.limit(100)

  if (error) {
    console.error('Failed to get audit logs:', error)
    return []
  }

  return data.map((log) => ({
    ...log,
    user_name: (log.user_profiles as any)?.full_name,
    user_email: (log.user_profiles as any)?.email,
  }))
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string
): Promise<AuditLog[]> {
  return getAuditLogs({ resourceType, resourceId })
}

/**
 * Get audit logs by module
 */
export async function getModuleAuditLogs(module: string): Promise<AuditLog[]> {
  return getAuditLogs({ module })
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      user_profiles:user_id (full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to get recent activity:', error)
    return []
  }

  return data.map((log) => ({
    ...log,
    user_name: (log.user_profiles as any)?.full_name,
    user_email: (log.user_profiles as any)?.email,
  }))
}

/**
 * Get action counts by module
 */
export async function getActionCounts(
  startDate?: Date,
  endDate?: Date
): Promise<Record<string, number>> {
  if (!isSupabaseConfigured || !supabase) {
    return {}
  }

  let query = supabase
    .from('audit_logs')
    .select('module_name')

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString())
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to get action counts:', error)
    return {}
  }

  const counts: Record<string, number> = {}
  data?.forEach((log) => {
    counts[log.module_name] = (counts[log.module_name] || 0) + 1
  })

  return counts
}

/**
 * Format audit action for display
 */
export function formatAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    create: 'Criou',
    update: 'Atualizou',
    delete: 'Excluiu',
    approve: 'Aprovou',
    reject: 'Rejeitou',
    view: 'Visualizou',
  }
  return labels[action] || action
}

/**
 * Get action color for UI
 */
export function getActionColor(action: AuditAction): string {
  const colors: Record<AuditAction, string> = {
    create: 'text-green-600 bg-green-50',
    update: 'text-blue-600 bg-blue-50',
    delete: 'text-red-600 bg-red-50',
    approve: 'text-green-600 bg-green-50',
    reject: 'text-red-600 bg-red-50',
    view: 'text-gray-600 bg-gray-50',
  }
  return colors[action] || 'text-gray-600 bg-gray-50'
}
