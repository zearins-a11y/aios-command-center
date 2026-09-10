import { create } from 'zustand';
import {
  Appeal,
  AppealStatus,
  AppealsConfig,
  AppealGrounds,
  AppealDecision,
  AppealEvidence,
  DEFAULT_APPEALS_CONFIG,
  createAppeal,
  canAppealItem,
  canWithdrawAppeal,
  getSlaStatus,
  getTimeRemaining,
  APPEAL_STATUS_LABELS,
  APPEAL_DECISION_LABELS,
} from '../utils/appealsProcess';

interface AppealsStore {
  // Appeals data
  appeals: Appeal[];

  // Configuration
  config: AppealsConfig;

  // Filters
  statusFilter: AppealStatus | 'all';
  setStatusFilter: (status: AppealStatus | 'all') => void;

  // Actions
  submitAppeal: (
    approvalItemId: string,
    approvalItemTitle: string,
    submittedBy: string,
    grounds: AppealGrounds,
    justification: string,
    evidence?: AppealEvidence[]
  ) => void;

  withdrawAppeal: (appealId: string, withdrawnBy: string) => void;

  assignReviewer: (
    appealId: string,
    reviewerId: string,
    reviewerName: string
  ) => void;

  startReview: (appealId: string, reviewerId: string) => void;

  decideAppeal: (
    appealId: string,
    decision: AppealDecision,
    reviewerNotes: string
  ) => void;

  addNote: (appealId: string, note: string, actor: string) => void;

  escalatePriority: (appealId: string) => void;

  updateConfig: (updates: Partial<AppealsConfig>) => void;

  // Queries
  getAppealsForItem: (approvalItemId: string) => Appeal[];
  getAppealsByStatus: (status: Appeal['status']) => Appeal[];
  getPendingAppeals: () => Appeal[];
  getUrgentAppeals: () => Appeal[];
  canSubmitAppeal: (approvalItemId: string, itemStatus: string) => { canAppeal: boolean; reason?: string };
  canUserWithdraw: (appealId: string) => boolean;
  getSlaInfo: (appealId: string) => { status: 'ok' | 'warning' | 'critical' | 'breached'; timeRemaining: string };
}

export const useAppealsStore = create<AppealsStore>((set, get) => ({
  appeals: [
    // Mock data - appeals on rejected/blocked items
    {
      id: 'appeal-1',
      approvalItemId: 'approval-2',
      approvalItemTitle: 'Post sobre nova funcionalidade do produto',
      status: 'under_review',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24h ago
      reviewedAt: null,
      decidedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h remaining
      submittedBy: 'Operador',
      originalReviewerId: 'strategist',
      assignedReviewerId: 'brand_guardian',
      assignedReviewerName: 'Brand Guardian',
      grounds: 'context_missing',
      justification: 'O contexto de lançamento foi fornecido posteriormente e demonstra que o post não viola políticas de confidencialidade. A feature já foi anunciada oficialmente pela empresa.',
      evidence: [
        {
          type: 'link',
          content: 'https://empresa.com/press-release',
          description: 'Release oficial da empresa',
        },
      ],
      reviewerNotes: '',
      decision: null,
      timeline: [
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          action: 'created',
          actor: 'Operador',
          details: 'Recurso criado',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
          action: 'submitted',
          actor: 'Operador',
          details: 'Recurso submetido para revisão',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
          action: 'assigned',
          actor: 'System',
          details: 'Atribuído a Brand Guardian',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20),
          action: 'under_review',
          actor: 'Brand Guardian',
          details: 'Revisão iniciada',
        },
      ],
      priority: 'normal',
      slaDeadlineHours: 48,
      reminderSent: false,
    },
    {
      id: 'appeal-2',
      approvalItemId: 'approval-4',
      approvalItemTitle: 'Artigo sobre estratégia de crescimento',
      status: 'submitted',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      reviewedAt: null,
      decidedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 46), // 46h remaining
      submittedBy: 'Operador',
      originalReviewerId: 'strategist',
      assignedReviewerId: null,
      assignedReviewerName: null,
      grounds: 'factual_error',
      justification: 'O post foi bloqueado por suposta imprecisão factual, mas citei dados oficiais da empresa. Peço reconsideração com base nos documentos anexados.',
      evidence: [
        {
          type: 'document',
          content: 'Relatório_trimestral_Q3.pdf',
          description: 'Dados oficiais do Q3',
        },
      ],
      reviewerNotes: '',
      decision: null,
      timeline: [
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          action: 'created',
          actor: 'Operador',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
          action: 'submitted',
          actor: 'Operador',
          details: 'Recurso submetido',
        },
      ],
      priority: 'elevated',
      slaDeadlineHours: 48,
      reminderSent: false,
    },
    {
      id: 'appeal-3',
      approvalItemId: 'approval-6',
      approvalItemTitle: 'Post sobre partnership',
      status: 'approved',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48h ago
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12h ago
      decidedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12h ago
      expiresAt: null,
      submittedBy: 'Operador',
      originalReviewerId: 'strategist',
      assignedReviewerId: 'legal_compliance',
      assignedReviewerName: 'Legal Compliance',
      grounds: 'proportionality',
      justification: 'A rejeição foi muito severa para uma questão menor de formatação.',
      evidence: [],
      reviewerNotes: 'Revisado. De fato, a rejeição original foi desproporcional. Post aprovado com ajustes mínimos.',
      decision: 'overturned',
      timeline: [
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
          action: 'created',
          actor: 'Operador',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47),
          action: 'submitted',
          actor: 'Operador',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 46),
          action: 'assigned',
          actor: 'System',
          details: 'Atribuído a Legal Compliance',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
          action: 'decided',
          actor: 'Legal Compliance',
          details: 'Decisão tomada: Reformado',
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
          action: 'overturned',
          actor: 'Legal Compliance',
          details: 'Decisão original revogada',
        },
      ],
      priority: 'normal',
      slaDeadlineHours: 48,
      reminderSent: true,
    },
  ],

  config: DEFAULT_APPEALS_CONFIG,

  statusFilter: 'all',
  setStatusFilter: (status) => set({ statusFilter: status }),

  submitAppeal: (approvalItemId, approvalItemTitle, submittedBy, grounds, justification, evidence = []) => {
    const { config } = get();
    const appeal = createAppeal(
      approvalItemId,
      approvalItemTitle,
      submittedBy,
      grounds,
      justification,
      evidence,
      config
    );

    // Update status to submitted
    appeal.status = 'submitted';
    appeal.submittedAt = new Date();
    appeal.expiresAt = new Date(Date.now() + config.defaultSlaHours * 60 * 60 * 1000);
    appeal.timeline.push({
      timestamp: new Date(),
      action: 'submitted',
      actor: submittedBy,
      details: 'Recurso submetido para revisão',
    });

    set((state) => ({
      appeals: [appeal, ...state.appeals],
    }));
  },

  withdrawAppeal: (appealId, withdrawnBy) => {
    set((state) => ({
      appeals: state.appeals.map((appeal) =>
        appeal.id === appealId
          ? {
              ...appeal,
              status: 'withdrawn' as const,
              timeline: [
                ...appeal.timeline,
                {
                  timestamp: new Date(),
                  action: 'withdrawn' as const,
                  actor: withdrawnBy,
                  details: 'Recurso retirado pelo autor',
                },
              ],
            }
          : appeal
      ),
    }));
  },

  assignReviewer: (appealId, reviewerId, reviewerName) => {
    set((state) => ({
      appeals: state.appeals.map((appeal) =>
        appeal.id === appealId
          ? {
              ...appeal,
              assignedReviewerId: reviewerId,
              assignedReviewerName: reviewerName,
              timeline: [
                ...appeal.timeline,
                {
                  timestamp: new Date(),
                  action: 'assigned' as const,
                  actor: 'System',
                  details: `Atribuído a ${reviewerName}`,
                },
              ],
            }
          : appeal
      ),
    }));
  },

  startReview: (appealId, reviewerId) => {
    set((state) => ({
      appeals: state.appeals.map((appeal) =>
        appeal.id === appealId
          ? {
              ...appeal,
              status: 'under_review' as const,
              reviewedAt: new Date(),
              timeline: [
                ...appeal.timeline,
                {
                  timestamp: new Date(),
                  action: 'under_review' as const,
                  actor: reviewerId,
                  details: 'Revisão iniciada',
                },
              ],
            }
          : appeal
      ),
    }));
  },

  decideAppeal: (appealId, decision, reviewerNotes) => {
    set((state) => ({
      appeals: state.appeals.map((appeal) =>
        appeal.id === appealId
          ? {
              ...appeal,
              status: decision === 'remanded' ? 'submitted' : (decision === 'overturned' ? 'approved' : 'rejected') as Appeal['status'],
              decidedAt: new Date(),
              reviewerNotes,
              decision,
              timeline: [
                ...appeal.timeline,
                {
                  timestamp: new Date(),
                  action: 'decided' as const,
                  actor: appeal.assignedReviewerName || 'Reviewer',
                  details: `Decisão: ${APPEAL_DECISION_LABELS[decision]}`,
                },
                {
                  timestamp: new Date(),
                  action: decision as any,
                  actor: appeal.assignedReviewerName || 'Reviewer',
                  details: APPEAL_DECISION_LABELS[decision],
                },
              ],
            }
          : appeal
      ),
    }));
  },

  addNote: (appealId, note, actor) => {
    set((state) => ({
      appeals: state.appeals.map((appeal) =>
        appeal.id === appealId
          ? {
              ...appeal,
              timeline: [
                ...appeal.timeline,
                {
                  timestamp: new Date(),
                  action: 'note_added' as const,
                  actor,
                  details: note,
                },
              ],
            }
          : appeal
      ),
    }));
  },

  escalatePriority: (appealId) => {
    set((state) => ({
      appeals: state.appeals.map((appeal) =>
        appeal.id === appealId
          ? {
              ...appeal,
              priority: appeal.priority === 'urgent' ? 'urgent' : 'urgent',
              timeline: [
                ...appeal.timeline,
                {
                  timestamp: new Date(),
                  action: 'note_added' as const,
                  actor: 'System',
                  details: 'Prioridade escalada para urgente',
                },
              ],
            }
          : appeal
      ),
    }));
  },

  updateConfig: (updates) => {
    set((state) => ({
      config: { ...state.config, ...updates },
    }));
  },

  // Queries
  getAppealsForItem: (approvalItemId) => {
    return get().appeals.filter((a) => a.approvalItemId === approvalItemId);
  },

  getAppealsByStatus: (status) => {
    return get().appeals.filter((a) => a.status === status);
  },

  getPendingAppeals: () => {
    return get().appeals.filter((a) =>
      ['submitted', 'under_review'].includes(a.status)
    );
  },

  getUrgentAppeals: () => {
    return get().appeals.filter((a) => {
      if (a.priority === 'urgent') return true;
      const slaStatus = getSlaStatus(a, get().config);
      return slaStatus === 'critical' || slaStatus === 'breached';
    });
  },

  canSubmitAppeal: (approvalItemId, itemStatus) => {
    const { config, appeals } = get();
    const existingAppeals = appeals.filter((a) => a.approvalItemId === approvalItemId);
    return canAppealItem(itemStatus, existingAppeals.length, config);
  },

  canUserWithdraw: (appealId) => {
    const appeal = get().appeals.find((a) => a.id === appealId);
    if (!appeal) return false;
    return canWithdrawAppeal(appeal, get().config);
  },

  getSlaInfo: (appealId) => {
    const appeal = get().appeals.find((a) => a.id === appealId);
    if (!appeal) return { status: 'ok' as const, timeRemaining: '' };
    return {
      status: getSlaStatus(appeal, get().config),
      timeRemaining: getTimeRemaining(appeal.expiresAt),
    };
  },
}));

// Re-export types and utils
export { APPEAL_STATUS_LABELS, APPEAL_DECISION_LABELS };
export type { AppealStatus, AppealGrounds, AppealDecision, AppealEvidence };
