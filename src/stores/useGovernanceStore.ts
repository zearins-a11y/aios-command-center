import { create } from 'zustand';
import {
  ApprovalItem,
  ApprovalItemWithScore,
  SensitiveAction,
  AgentRoleData,
  AuditLogEntry,
  FlowStage,
  ApprovalStatus,
  SensitiveActionStatus,
} from '../types/governance';
import {
  mockPendingApprovals,
  mockSensitiveActions,
  mockAgentRoles,
  mockAuditLog,
} from '../data/governance';
import { rankApprovalItems } from '../utils/crossCheckRanker';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { subscribeToTable, unsubscribe, RealtimePayload } from '../lib/realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ApprovalItem as DbApprovalItem } from '../lib/types';

interface GovernanceStore {
  // Flow
  currentStage: FlowStage;
  completedStages: FlowStage[];
  setCurrentStage: (stage: FlowStage) => void;
  completeStage: (stage: FlowStage) => void;

  // Approvals - with risk scoring
  pendingApprovals: ApprovalItem[];
  rankedApprovals: ApprovalItemWithScore[];
  selectedApprovalId: string | null;
  selectApproval: (id: string | null) => void;
  updateApprovalStatus: (id: string, status: ApprovalStatus, message?: string) => void;
  requestRevision: (id: string, feedback: string) => void;

  // Sensitive Actions
  sensitiveActions: SensitiveAction[];
  approveSensitiveAction: (id: string) => void;
  rejectSensitiveAction: (id: string) => void;

  // Agent Roles
  agentRoles: AgentRoleData[];
  updateAgentStatus: (id: string, status: 'idle' | 'working' | 'blocked') => void;

  // Audit Log
  auditLog: AuditLogEntry[];
  addAuditEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // UI
  showApprovalModal: boolean;
  setShowApprovalModal: (show: boolean) => void;

  // Supabase integration
  isLoading: boolean;
  isSupabaseConnected: boolean;
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
  subscribeRealtime: () => void;
  unsubscribeRealtime: () => void;
}

export const useGovernanceStore = create<GovernanceStore>((set, get) => {
  // Realtime subscription reference
  let realtimeChannel: RealtimeChannel | null = null;

  // Helper to convert DB item to app type
  const dbToApprovalItem = (db: DbApprovalItem): ApprovalItem => ({
    id: db.id,
    type: (db.type === 'email' || db.type === 'instagram' || db.type === 'linkedin' ||
           db.type === 'whatsapp' || db.type === 'blog' || db.type === 'tiktok'
           ? db.type : 'email') as ApprovalItem['type'],
    title: db.title,
    account: db.content ? String((db.content as Record<string, unknown>)?.platform || db.type) : db.type,
    content: (db.content as ApprovalItem['content']) || { copy: '' },
    guardianAlerts: ((db.guardian_alerts || []) as unknown[]).map((alert, i) => ({
      id: `alert-${i}`,
      message: String(alert),
      status: 'warning' as const,
    })),
    checksum: db.checksum || '',
    sourcesCount: 0,
    createdBy: 'system',
    agents: [],
    status: (db.status === 'pending' || db.status === 'approved' || db.status === 'rejected' || db.status === 'revision_requested'
             ? db.status : 'pending') as ApprovalItem['status'],
    urgency: (db.urgency === 'low' || db.urgency === 'normal' || db.urgency === 'high' || db.urgency === 'critical'
              ? db.urgency : 'normal') as ApprovalItem['urgency'],
    createdAt: new Date(db.created_at),
    pendingSince: db.pending_since ? new Date(db.pending_since) : new Date(),
  });

  // Helper to convert app item to DB format
  const approvalItemToDb = (item: ApprovalItem) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    content: item.content as Record<string, unknown>,
    guardian_alerts: item.guardianAlerts.map(a => ({ message: a.message, status: a.status })),
    checksum: item.checksum,
    status: item.status,
    urgency: item.urgency,
    pending_since: item.pendingSince?.toISOString(),
    created_at: item.createdAt?.toISOString(),
  });

  return {
    // Flow - starts with research, creation, validation completed
    currentStage: 'human_gate',
    completedStages: ['research', 'creation', 'validation'],

    setCurrentStage: (stage) => set({ currentStage: stage }),

    completeStage: (stage) =>
      set((state) => ({
        completedStages: state.completedStages.includes(stage)
          ? state.completedStages
          : [...state.completedStages, stage],
      })),

    // Approvals
    pendingApprovals: mockPendingApprovals,
    rankedApprovals: rankApprovalItems(mockPendingApprovals),
    selectedApprovalId: null,

    selectApproval: (id) =>
      set({ selectedApprovalId: id, showApprovalModal: id !== null }),

    updateApprovalStatus: async (id, status, message) => {
      const { pendingApprovals } = get();
      const approval = pendingApprovals.find((a) => a.id === id);

      if (!approval) return;

      // Add audit entry
      const newAuditEntry: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date(),
        agent: 'humano',
        action:
          status === 'approved'
            ? 'Aprovar publicacao'
            : status === 'rejected'
            ? 'Rejeitar publicacao'
            : 'Solicitar revisao',
        checksum: approval.checksum.substring(0, 8),
        approver: 'Voce',
        result: status === 'approved' ? 'published' : status === 'rejected' ? 'rejected' : 'warning',
        details: message,
      };

      if (status === 'approved' || status === 'rejected') {
        const newPending = pendingApprovals.filter((a) => a.id !== id);
        set({
          pendingApprovals: newPending,
          rankedApprovals: rankApprovalItems(newPending),
          auditLog: [newAuditEntry, ...get().auditLog],
          showApprovalModal: false,
          selectedApprovalId: null,
        });
      } else {
        set((state) => ({
          pendingApprovals: state.pendingApprovals.map((a) =>
            a.id === id ? { ...a, status: 'revision_requested' } : a
          ),
          rankedApprovals: rankApprovalItems(state.pendingApprovals.map((a) =>
            a.id === id ? { ...a, status: 'revision_requested' } : a
          )),
          auditLog: [newAuditEntry, ...state.auditLog],
          showApprovalModal: false,
          selectedApprovalId: null,
        }));
      }

      // Sync to Supabase if connected
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('approval_items')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
      }
    },

    requestRevision: (id, feedback) => {
      get().updateApprovalStatus(id, 'revision_requested', feedback);
    },

    // Sensitive Actions
    sensitiveActions: mockSensitiveActions,

    approveSensitiveAction: (id) =>
      set((state) => ({
        sensitiveActions: state.sensitiveActions.map((a) =>
          a.id === id ? { ...a, status: 'approved' as SensitiveActionStatus } : a
        ),
      })),

    rejectSensitiveAction: (id) =>
      set((state) => ({
        sensitiveActions: state.sensitiveActions.map((a) =>
          a.id === id ? { ...a, status: 'rejected' as SensitiveActionStatus } : a
        ),
      })),

    // Agent Roles
    agentRoles: mockAgentRoles,

    updateAgentStatus: (id, status) =>
      set((state) => ({
        agentRoles: state.agentRoles.map((a) =>
          a.id === id ? { ...a, status } : a
        ),
      })),

    // Audit Log
    auditLog: mockAuditLog,

    addAuditEntry: (entry) =>
      set((state) => ({
        auditLog: [
          { ...entry, id: `log-${Date.now()}`, timestamp: new Date() },
          ...state.auditLog,
        ].slice(0, 50),
      })),

    // UI
    showApprovalModal: false,
    setShowApprovalModal: (show) => set({ showApprovalModal: show }),

    // Supabase integration
    isLoading: false,
    isSupabaseConnected: isSupabaseConfigured,

    loadFromSupabase: async () => {
      if (!isSupabaseConfigured || !supabase) return;

      set({ isLoading: true });
      try {
        // Load approval items
        const { data: approvals, error: approvalsError } = await supabase
          .from('approval_items')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!approvalsError && approvals) {
          const items = approvals.map(dbToApprovalItem);
          set({
            pendingApprovals: items,
            rankedApprovals: rankApprovalItems(items),
          });
        }

        // Load audit log
        const { data: audit } = await supabase
          .from('agent_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (audit && audit.length > 0) {
          const validResults = ['success', 'draft', 'approved', 'published', 'rejected', 'warning'] as const;
          const auditEntries: AuditLogEntry[] = audit.map((log) => ({
            id: log.id,
            timestamp: new Date(log.created_at),
            agent: log.agent,
            action: log.message,
            checksum: (log.metadata as Record<string, string>)?.checksum || '',
            approver: log.agent,
            result: validResults.includes(((log.metadata as Record<string, string>)?.result || 'info') as typeof validResults[number])
              ? ((log.metadata as Record<string, string>)?.result || 'info') as AuditLogEntry['result']
              : 'success',
            details: (log.metadata as Record<string, string>)?.details || '',
          }));
          set({ auditLog: auditEntries });
        }
      } catch (error) {
        console.error('Failed to load from Supabase:', error);
      } finally {
        set({ isLoading: false });
      }
    },

    syncToSupabase: async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const { pendingApprovals } = get();
      try {
        for (const item of pendingApprovals) {
          await supabase
            .from('approval_items')
            .upsert(approvalItemToDb(item));
        }
      } catch (error) {
        console.error('Failed to sync to Supabase:', error);
      }
    },

    subscribeRealtime: () => {
      if (!isSupabaseConfigured || !supabase || realtimeChannel) return;

      realtimeChannel = subscribeToTable<DbApprovalItem>('approval_items', (payload: RealtimePayload<DbApprovalItem>) => {
        const { pendingApprovals } = get();

        if (payload.eventType === 'INSERT') {
          const newItem = dbToApprovalItem(payload.new);
          if (newItem.status === 'pending' && !pendingApprovals.find((a) => a.id === newItem.id)) {
            set({
              pendingApprovals: [newItem, ...pendingApprovals],
              rankedApprovals: rankApprovalItems([newItem, ...pendingApprovals]),
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedItem = dbToApprovalItem(payload.new);
          if (updatedItem.status === 'pending') {
            const exists = pendingApprovals.find((a) => a.id === updatedItem.id);
            if (!exists) {
              set({
                pendingApprovals: [updatedItem, ...pendingApprovals],
                rankedApprovals: rankApprovalItems([updatedItem, ...pendingApprovals]),
              });
            } else {
              set({
                pendingApprovals: pendingApprovals.map((a) =>
                  a.id === updatedItem.id ? updatedItem : a
                ),
                rankedApprovals: rankApprovalItems(pendingApprovals.map((a) =>
                  a.id === updatedItem.id ? updatedItem : a
                )),
              });
            }
          } else {
            set({
              pendingApprovals: pendingApprovals.filter((a) => a.id !== updatedItem.id),
              rankedApprovals: rankApprovalItems(
                pendingApprovals.filter((a) => a.id !== updatedItem.id)
              ),
            });
          }
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id?: string }).id;
          if (oldId) {
            set({
              pendingApprovals: pendingApprovals.filter((a) => a.id !== oldId),
              rankedApprovals: rankApprovalItems(
                pendingApprovals.filter((a) => a.id !== oldId)
              ),
            });
          }
        }
      });

      console.log('Governance store subscribed to realtime');
    },

    unsubscribeRealtime: () => {
      if (realtimeChannel) {
        unsubscribe(realtimeChannel);
        realtimeChannel = null;
        console.log('Governance store unsubscribed from realtime');
      }
    },
  };
});
