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
}

export const useGovernanceStore = create<GovernanceStore>((set, get) => ({
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

  updateApprovalStatus: (id, status, message) => {
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
      ].slice(0, 50), // Keep only last 50 entries
    })),

  // UI
  showApprovalModal: false,
  setShowApprovalModal: (show) => set({ showApprovalModal: show }),
}));
