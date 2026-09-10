/**
 * Invitations service - Create and manage invitations
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { auth } from './auth'

export interface Invitation {
  id: string
  team_id: string
  team_name?: string
  email: string
  role_id: string
  role_name?: string
  invited_by: string
  invited_by_name?: string
  token: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
}

export interface InvitationResult {
  success: boolean
  error?: string
  invitation?: Invitation
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  teamId: string,
  email: string,
  roleId: string
): Promise<InvitationResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase não configurado' }
  }

  const user = await auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // Generate secure token
  const token = generateToken()

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      team_id: teamId,
      email: email,
      role_id: roleId,
      invited_by: user.id,
      token,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, invitation: data }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      teams:team_id (name),
      roles:role_id (name),
      invited_by_user:invited_by (full_name)
    `)
    .eq('token', token)
    .single()

  if (error) {
    return null
  }

  return {
    ...data,
    team_name: (data.teams as any)?.name,
    role_name: (data.roles as any)?.name,
    invited_by_name: (data.invited_by_user as any)?.full_name,
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<InvitationResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase não configurado' }
  }

  // Use the database function
  const { error } = await supabase.rpc('accept_invitation', { p_token: token })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<InvitationResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase não configurado' }
  }

  const { error } = await supabase
    .from('invitations')
    .update({ status: 'cancelled' })
    .eq('id', invitationId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get pending invitations for current user's teams
 */
export async function getPendingInvitations(): Promise<Invitation[]> {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  const { data: invitationsData, error } = await supabase
    .from('invitations')
    .select(`
      *,
      teams:team_id (name),
      roles:role_id (name),
      invited_by_user:invited_by (full_name)
    `)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get invitations:', error)
    return []
  }

  return (invitationsData || []).map((inv) => ({
    ...inv,
    team_name: (inv.teams as any)?.name,
    role_name: (inv.roles as any)?.name,
    invited_by_name: (inv.invited_by_user as any)?.full_name,
  }))
}

/**
 * Get invite link for sharing
 */
export function getInviteLink(token: string): string {
  return `${window.location.origin}/accept-invite?token=${token}`
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
