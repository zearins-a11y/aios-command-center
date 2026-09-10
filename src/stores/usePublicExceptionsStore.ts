import { create } from 'zustand';
import {
  PublicException,
  ExceptionType,
  ExceptionStatus,
  ExceptionSeverity,
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
  SEVERITY_LABELS,
  createPublicException,
  calculateExceptionRisk,
  isExceptionActive,
  getExceptionAge,
  getTimeUntilExpiration,
} from '../utils/publicExceptions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface PublicExceptionsStore {
  // Data
  exceptions: PublicException[];

  // Filters
  typeFilter: ExceptionType | 'all';
  setTypeFilter: (type: ExceptionType | 'all') => void;
  statusFilter: ExceptionStatus | 'all';
  setStatusFilter: (status: ExceptionStatus | 'all') => void;
  severityFilter: ExceptionSeverity | 'all';
  setSeverityFilter: (severity: ExceptionSeverity | 'all') => void;

  // Actions
  createException: (
    referenceId: string,
    referenceTitle: string,
    referenceType: PublicException['referenceType'],
    type: ExceptionType,
    title: string,
    description: string,
    justification: string,
    requestedBy: string,
    requestedByRole: string,
    severity?: ExceptionSeverity,
    options?: {
      businessImpact?: string;
      riskAssessment?: string;
      conditions?: string[];
      monitoringRequired?: boolean;
      expirationDate?: Date;
      tags?: string[];
    }
  ) => void;

  approveException: (
    exceptionId: string,
    approvedBy: string,
    notes: string,
    conditions?: string[],
    expirationDate?: Date
  ) => void;
  rejectException: (exceptionId: string, rejectedBy: string, reason: string) => void;
  revokeException: (exceptionId: string, revokedBy: string, reason: string) => void;
  resolveException: (exceptionId: string, notes: string, lessonsLearned?: string) => void;
  linkException: (exceptionId: string, relatedId: string) => void;

  // Queries
  getExceptionById: (exceptionId: string) => PublicException | undefined;
  getFilteredExceptions: () => PublicException[];
  getActiveExceptions: () => PublicException[];
  getPendingExceptions: () => PublicException[];
  getExpiringSoon: (days?: number) => PublicException[];
  getOverallStats: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    avgResolutionTime: number;
    highRiskCount: number;
  };

  // Supabase integration
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

export const usePublicExceptionsStore = create<PublicExceptionsStore>((set, get) => ({
  exceptions: [
    // Mock exceptions for demo
    {
      id: 'exception-1',
      referenceId: 'approval-5',
      referenceTitle: 'Post sobre promoção flash',
      referenceType: 'approval',
      type: 'content_approval',
      status: 'approved',
      severity: 'medium',
      title: 'Aprovação de oferta por tempo limitado',
      description: 'Post sobre promoção com desconto de 50% válido por 24h.',
      justification: 'Promoção de Black Friday antecipada para clientes VIP. Urgência de negócio.',
      businessImpact: 'Potencial aumento de 15% nas vendas do dia.',
      riskAssessment: 'Risco baixo - oferta verificável e términos claros.',
      requestedBy: 'Marketing Lead',
      requestedByRole: 'marketing',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      approvedBy: 'Operador',
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5),
      approvalNotes: 'Aprovado com condição de adicionar disclaimer sobre termos.',
      conditions: ['Incluir "Consulte condições"', 'Disponibilizar regulamento completo'],
      monitoringRequired: true,
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Expires tomorrow
      isPublic: true,
      stakeholderNotification: true,
      stakeholderNotificationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      impactMetrics: {
        affectedContent: 1,
        affectedTime: 0,
        revenueImpact: '+15% vendas',
        reputationRisk: 'low',
      },
      resolvedAt: null,
      resolutionNotes: null,
      lessonsLearned: null,
      tags: ['promoção', 'urgente', 'black-friday'],
      relatedExceptions: [],
    },
    {
      id: 'exception-2',
      referenceId: 'strike-3',
      referenceTitle: 'Strike de compliance',
      referenceType: 'strike',
      type: 'compliance_waiver',
      status: 'pending',
      severity: 'high',
      title: 'Dispensa temporária de verificação de fontes',
      description: 'Solicitação para liberar post sem verificação completa de fontes.',
      justification: 'Deadline de lançamento de produto iminente. Verificação pode atrasar em 48h.',
      businessImpact: 'Risco de comunicação incorreta sem verificação completa.',
      riskAssessment: 'Risco médio-alto - pode resultar em informação imprecisa.',
      requestedBy: 'Product Manager',
      requestedByRole: 'product',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12h ago
      approvedBy: null,
      approvedAt: null,
      approvalNotes: null,
      conditions: [],
      monitoringRequired: false,
      expirationDate: null,
      isPublic: true,
      stakeholderNotification: false,
      stakeholderNotificationDate: null,
      impactMetrics: {
        affectedContent: 1,
        affectedTime: 48,
        reputationRisk: 'medium',
      },
      resolvedAt: null,
      resolutionNotes: null,
      lessonsLearned: null,
      tags: ['compliance', 'urgente', 'produto'],
      relatedExceptions: [],
    },
    {
      id: 'exception-3',
      referenceId: 'policy-2',
      referenceTitle: 'Política de dual publishing',
      referenceType: 'policy',
      type: 'policy_override',
      status: 'approved',
      severity: 'low',
      title: 'Override de janela de publicação',
      description: 'Permitir publicação fora da janela permitida (8h-18h).',
      justification: 'Campanha de influenciador com horário específico de post.',
      businessImpact: 'Negociação de influenciador requer flexibilidade.',
      riskAssessment: 'Risco mínimo - post será revisado normalmente.',
      requestedBy: 'Social Media Manager',
      requestedByRole: 'social',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      approvedBy: 'Operador',
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6.5),
      approvalNotes: 'Aprovado para este caso específico.',
      conditions: ['Manter revisão de conteúdo'],
      monitoringRequired: false,
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23), // Expires in 23 days
      isPublic: true,
      stakeholderNotification: false,
      stakeholderNotificationDate: null,
      impactMetrics: {
        affectedContent: 1,
        affectedTime: 0,
        reputationRisk: 'none',
      },
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
      resolutionNotes: 'Post publicado com sucesso no horário solicitado.',
      lessonsLearned: 'Considerar janelas flexíveis para campanhas específicas.',
      tags: ['horário', 'campanha', 'influenciador'],
      relatedExceptions: [],
    },
    {
      id: 'exception-4',
      referenceId: 'appeal-2',
      referenceTitle: 'Recurso sobre bloqueio de post',
      referenceType: 'appeal',
      type: 'content_approval',
      status: 'rejected',
      severity: 'medium',
      title: 'Recurso para desbloquear post sobre dados financeiros',
      description: 'Solicitação para publicar post com métricas financeiras.',
      justification: 'Dados já foram publicados em release oficial.',
      businessImpact: 'Post pode antecipar informações sensíveis ao mercado.',
      riskAssessment: 'Risco alto - potencial violação de reg SEC/comissão de valores.',
      requestedBy: 'Investor Relations',
      requestedByRole: 'finance',
      requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      approvedBy: 'Operador',
      approvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      approvalNotes: 'Rejeitado - aguardando comunicado oficial de IR.',
      conditions: [],
      monitoringRequired: false,
      expirationDate: null,
      isPublic: true,
      stakeholderNotification: true,
      stakeholderNotificationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      impactMetrics: {
        affectedContent: 0,
        affectedTime: 0,
        reputationRisk: 'none',
      },
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      resolutionNotes: 'Recurso negado. Post mantido bloqueado.',
      lessonsLearned: 'Protocolos de RI devem ser consultados antes de qualquer post sobre resultados.',
      tags: ['financeiro', 'compliance', 'recurso'],
      relatedExceptions: [],
    },
  ],

  typeFilter: 'all',
  setTypeFilter: (type) => set({ typeFilter: type }),
  statusFilter: 'all',
  setStatusFilter: (status) => set({ statusFilter: status }),
  severityFilter: 'all',
  setSeverityFilter: (severity) => set({ severityFilter: severity }),

  createException: (referenceId, referenceTitle, referenceType, type, title, description, justification, requestedBy, requestedByRole, severity, options) => {
    const newException = createPublicException(
      referenceId, referenceTitle, referenceType, type, title, description, justification, requestedBy, requestedByRole, severity, options
    );
    set((state) => ({
      exceptions: [newException, ...state.exceptions],
    }));
  },

  approveException: (exceptionId, approvedBy, notes, conditions, expirationDate) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              status: 'approved' as const,
              approvedBy,
              approvedAt: new Date(),
              approvalNotes: notes,
              conditions: conditions || e.conditions,
              expirationDate: expirationDate || e.expirationDate,
            }
          : e
      ),
    }));
  },

  rejectException: (exceptionId, rejectedBy, reason) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              status: 'rejected' as const,
              approvedBy: rejectedBy,
              approvedAt: new Date(),
              approvalNotes: reason,
            }
          : e
      ),
    }));
  },

  revokeException: (exceptionId, revokedBy, reason) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              status: 'revoked' as const,
              approvalNotes: reason,
              resolvedAt: new Date(),
              resolutionNotes: `Revogada por ${revokedBy}: ${reason}`,
            }
          : e
      ),
    }));
  },

  resolveException: (exceptionId, notes, lessonsLearned) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              resolvedAt: new Date(),
              resolutionNotes: notes,
              lessonsLearned: lessonsLearned || e.lessonsLearned,
            }
          : e
      ),
    }));
  },

  linkException: (exceptionId, relatedId) => {
    set((state) => ({
      exceptions: state.exceptions.map((e) =>
        e.id === exceptionId
          ? { ...e, relatedExceptions: [...e.relatedExceptions, relatedId] }
          : e.id === relatedId
          ? { ...e, relatedExceptions: [...e.relatedExceptions, exceptionId] }
          : e
      ),
    }));
  },

  getExceptionById: (exceptionId) => {
    return get().exceptions.find((e) => e.id === exceptionId);
  },

  getFilteredExceptions: () => {
    const { exceptions, typeFilter, statusFilter, severityFilter } = get();
    return exceptions.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
      return true;
    });
  },

  getActiveExceptions: () => {
    return get().exceptions.filter((e) => isExceptionActive(e));
  },

  getPendingExceptions: () => {
    return get().exceptions.filter((e) => e.status === 'pending');
  },

  getExpiringSoon: (days = 7) => {
    const cutoff = Date.now() + days * 24 * 60 * 60 * 1000;
    return get().exceptions.filter((e) => {
      if (!e.expirationDate) return false;
      return new Date(e.expirationDate).getTime() <= cutoff;
    });
  },

  getOverallStats: () => {
    const exceptions = get().exceptions;
    const pending = exceptions.filter((e) => e.status === 'pending').length;
    const approved = exceptions.filter((e) => e.status === 'approved').length;
    const rejected = exceptions.filter((e) => e.status === 'rejected' || e.status === 'revoked').length;
    const active = get().getActiveExceptions().length;
    const highRisk = exceptions.filter((e) => e.severity === 'high' || e.severity === 'critical').length;

    // Calculate avg resolution time
    const resolved = exceptions.filter((e) => e.resolvedAt);
    let avgResolutionTime = 0;
    if (resolved.length > 0) {
      const totalTime = resolved.reduce((sum, e) => {
        const diff = new Date(e.resolvedAt!).getTime() - new Date(e.requestedAt).getTime();
        return sum + diff / (1000 * 60 * 60); // hours
      }, 0);
      avgResolutionTime = Math.round((totalTime / resolved.length) * 10) / 10;
    }

    return {
      total: exceptions.length,
      pending,
      approved,
      rejected,
      active,
      avgResolutionTime,
      highRiskCount: highRisk,
    };
  },

  loadFromSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('public_exceptions')
        .select('*')
        .order('requested_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const loadedExceptions = data.map((db: any) => ({
          id: db.id,
          referenceId: db.reference_id || '',
          referenceTitle: db.reference_title || '',
          referenceType: (db.reference_type || 'approval') as PublicException['referenceType'],
          type: (db.type || 'policy_override') as ExceptionType,
          status: (db.status || 'pending') as ExceptionStatus,
          severity: (db.severity || 'low') as ExceptionSeverity,
          title: db.title || '',
          description: db.description || '',
          justification: db.justification || '',
          businessImpact: db.business_impact || '',
          riskAssessment: db.risk_assessment || '',
          requestedBy: db.requested_by || '',
          requestedByRole: db.requested_by_role || '',
          requestedAt: new Date(db.requested_at),
          approvedBy: db.approved_by || null,
          approvedAt: db.approved_at ? new Date(db.approved_at) : null,
          approvalNotes: db.approval_notes || '',
          conditions: db.conditions || [],
          monitoringRequired: db.monitoring_required || false,
          expirationDate: db.expiration_date ? new Date(db.expiration_date) : null,
          isPublic: db.is_public || false,
          stakeholderNotification: db.stakeholder_notification || false,
          stakeholderNotificationDate: db.stakeholder_notification_date ? new Date(db.stakeholder_notification_date) : null,
          impactMetrics: db.impact_metrics || { affectedContent: 0, affectedTime: 0, reputationRisk: 'none' },
          resolvedAt: db.resolved_at ? new Date(db.resolved_at) : null,
          resolutionNotes: db.resolution_notes || '',
          lessonsLearned: db.lessons_learned || '',
          tags: db.tags || [],
          relatedExceptions: db.related_exceptions || [],
        }));
        set({ exceptions: loadedExceptions });
      }
    } catch (error) {
      console.error('Failed to load exceptions from Supabase:', error);
    }
  },

  syncToSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { exceptions } = get();
    try {
      for (const exception of exceptions) {
        await supabase.from('public_exceptions').upsert({
          id: exception.id,
          reference_id: exception.referenceId,
          reference_title: exception.referenceTitle,
          reference_type: exception.referenceType,
          type: exception.type,
          status: exception.status,
          severity: exception.severity,
          title: exception.title,
          description: exception.description,
          justification: exception.justification,
          business_impact: exception.businessImpact,
          risk_assessment: exception.riskAssessment,
          requested_by: exception.requestedBy,
          requested_by_role: exception.requestedByRole,
          requested_at: exception.requestedAt.toISOString(),
          approved_by: exception.approvedBy,
          approved_at: exception.approvedAt?.toISOString(),
          approval_notes: exception.approvalNotes,
          conditions: exception.conditions,
          monitoring_required: exception.monitoringRequired,
          expiration_date: exception.expirationDate?.toISOString(),
          is_public: exception.isPublic,
          stakeholder_notification: exception.stakeholderNotification,
          stakeholder_notification_date: exception.stakeholderNotificationDate?.toISOString(),
          impact_metrics: exception.impactMetrics,
          resolved_at: exception.resolvedAt?.toISOString(),
          resolution_notes: exception.resolutionNotes,
          lessons_learned: exception.lessonsLearned,
          tags: exception.tags,
          related_exceptions: exception.relatedExceptions,
        });
      }
    } catch (error) {
      console.error('Failed to sync exceptions to Supabase:', error);
    }
  },
}));

// Re-export utilities
export {
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
  SEVERITY_LABELS,
  calculateExceptionRisk,
  isExceptionActive,
  getExceptionAge,
  getTimeUntilExpiration,
};
export type { PublicException, ExceptionType, ExceptionStatus, ExceptionSeverity };
