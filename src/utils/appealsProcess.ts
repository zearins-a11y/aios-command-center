/**
 * Appeals Process System
 * P1 from Benchmark Comparison
 *
 * When user disagrees with a rejection/block decision:
 * 1. User clicks "Appeal" on blocked/rejected item
 * 2. Creates new revision with contestation
 * 3. Different human reviewer assigned (not the same one)
 * 4. Decision within configurable timeframe (default 48h)
 */

import { AgentRole } from '../types/governance';

export type AppealStatus =
  | 'pending_submission'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'expired';

export interface AppealEvidence {
  type: 'text' | 'link' | 'document' | 'screenshot';
  content: string;
  description?: string;
}

export interface Appeal {
  id: string;
  // Reference to the original approval item
  approvalItemId: string;
  approvalItemTitle: string;

  // Appeal details
  status: AppealStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  decidedAt: Date | null;
  expiresAt: Date | null;

  // Who submitted
  submittedBy: string;

  // Who is reviewing (must be different from original reviewer)
  originalReviewerId?: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;

  // Grounds for appeal
  grounds: AppealGrounds;
  justification: string;
  evidence: AppealEvidence[];

  // Reviewer decision
  reviewerNotes: string;
  decision: AppealDecision | null;

  // Timeline
  timeline: AppealTimelineEntry[];

  // Priority (escalated appeals get higher priority)
  priority: 'normal' | 'elevated' | 'urgent';

  // Deadline tracking
  slaDeadlineHours: number; // default 48
  reminderSent: boolean;
}

export type AppealGrounds =
  | 'factual_error'
  | 'context_missing'
  | 'policy_misapplication'
  | 'new_information'
  | 'proportionality'
  | 'procedural_issue'
  | 'other';

export type AppealDecision =
  | 'overturned'      // original decision was wrong
  | 'upheld'          // original decision was correct
  | 'modified'        // original decision modified
  | 'remanded';       // sent back for re-review

export interface AppealTimelineEntry {
  timestamp: Date;
  action: AppealAction;
  actor: string;
  details?: string;
}

export type AppealAction =
  | 'created'
  | 'submitted'
  | 'assigned'
  | 'under_review'
  | 'reminder_sent'
  | 'decided'
  | 'overturned'
  | 'upheld'
  | 'modified'
  | 'remanded'
  | 'withdrawn'
  | 'expired'
  | 'note_added';

// Configuration
export interface AppealsConfig {
  enabled: boolean;
  defaultSlaHours: number;          // 48h default
  reminderBeforeHours: number;       // 12h before deadline
  escalationAfterHours: number;      // escalate after 48h
  maxAppealsPerItem: number;         // max 2 appeals per item
  requireDifferentReviewer: boolean;  // must be different from original
  allowEvidenceUpload: boolean;
  allowWithdrawal: boolean;
  autoExpireAfterDays: number;       // auto-expire appeals after 30 days
}

export const DEFAULT_APPEALS_CONFIG: AppealsConfig = {
  enabled: true,
  defaultSlaHours: 48,
  reminderBeforeHours: 12,
  escalationAfterHours: 48,
  maxAppealsPerItem: 2,
  requireDifferentReviewer: true,
  allowEvidenceUpload: true,
  allowWithdrawal: true,
  autoExpireAfterDays: 30,
};

// GROUND LABELS
export const APPEAL_GROUNDS_LABELS: Record<AppealGrounds, string> = {
  factual_error: 'Erro Factual',
  context_missing: 'Contexto Ausente',
  policy_misapplication: 'Aplicação Incorreta de Política',
  new_information: 'Nova Informação',
  proportionality: 'Proporcionalidade',
  procedural_issue: 'Irregularidade Processual',
  other: 'Outro',
};

export const APPEAL_GROUNDS_DESCRIPTIONS: Record<AppealGrounds, string> = {
  factual_error: 'O bloqueio/rejeição foi baseado em fato incorreto.',
  context_missing: 'Informações importantes não foram consideradas.',
  policy_misapplication: 'A política foi aplicada incorretamente ao caso.',
  new_information: 'Novas informações disponíveis após a decisão original.',
  proportionality: 'A penalidade é desproporcional à violação.',
  procedural_issue: 'Houve irregularidade no processo de revisão.',
  other: 'Outro motivo não listado acima.',
};

// STATUS LABELS
export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  pending_submission: 'Pendente',
  submitted: 'Submetido',
  under_review: 'Em Revisão',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  withdrawn: 'Retirado',
  expired: 'Expirado',
};

// DECISION LABELS
export const APPEAL_DECISION_LABELS: Record<AppealDecision, string> = {
  overturned: 'Decisão Reformada',
  upheld: 'Decisão Mantida',
  modified: 'Decisão Modificada',
  remanded: 'Devolvido para Revisão',
};

/**
 * Check if an item can be appealed
 */
export function canAppealItem(
  itemStatus: string,
  existingAppealsCount: number,
  config: AppealsConfig
): { canAppeal: boolean; reason?: string } {
  if (!config.enabled) {
    return { canAppeal: false, reason: 'Sistema de recursos desabilitado' };
  }

  if (existingAppealsCount >= config.maxAppealsPerItem) {
    return {
      canAppeal: false,
      reason: `Máximo de ${config.maxAppealsPerItem} recursos por item`
    };
  }

  const appealableStatuses = ['rejected', 'blocked', 'requires_revision'];
  if (!appealableStatuses.includes(itemStatus)) {
    return {
      canAppeal: false,
      reason: 'Este item não pode ser recorrido'
    };
  }

  return { canAppeal: true };
}

/**
 * Check if an appeal can be withdrawn
 */
export function canWithdrawAppeal(appeal: Appeal, config: AppealsConfig): boolean {
  if (!config.allowWithdrawal) return false;

  const withdrawableStatuses: AppealStatus[] = ['pending_submission', 'submitted'];
  return withdrawableStatuses.includes(appeal.status);
}

/**
 * Check if SLA is at risk
 */
export function getSlaStatus(
  appeal: Appeal,
  config: AppealsConfig
): 'ok' | 'warning' | 'critical' | 'breached' {
  if (!appeal.expiresAt || !appeal.submittedAt) return 'ok';

  const now = new Date();
  const expiresAt = new Date(appeal.expiresAt);
  const hoursRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursRemaining < 0) return 'breached';
  if (hoursRemaining < config.reminderBeforeHours / 2) return 'critical';
  if (hoursRemaining < config.reminderBeforeHours) return 'warning';
  return 'ok';
}

/**
 * Get time remaining until deadline
 */
export function getTimeRemaining(expiresAt: Date | null): string {
  if (!expiresAt) return '';

  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs < 0) return 'Expirado';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h restante`;
  }

  return `${hours}h ${minutes}m restante`;
}

/**
 * Create a new appeal
 */
export function createAppeal(
  approvalItemId: string,
  approvalItemTitle: string,
  submittedBy: string,
  grounds: AppealGrounds,
  justification: string,
  evidence: AppealEvidence[] = [],
  config: AppealsConfig = DEFAULT_APPEALS_CONFIG
): Appeal {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.defaultSlaHours * 60 * 60 * 1000);

  return {
    id: `appeal-${Date.now()}`,
    approvalItemId,
    approvalItemTitle,
    status: 'pending_submission',
    submittedAt: null,
    reviewedAt: null,
    decidedAt: null,
    expiresAt,
    submittedBy,
    assignedReviewerId: null,
    assignedReviewerName: null,
    grounds,
    justification,
    evidence,
    reviewerNotes: '',
    decision: null,
    timeline: [
      {
        timestamp: now,
        action: 'created',
        actor: submittedBy,
        details: 'Recurso criado',
      },
    ],
    priority: 'normal',
    slaDeadlineHours: config.defaultSlaHours,
    reminderSent: false,
  };
}

/**
 * Get available grounds for appeal
 */
export function getAvailableGrounds(): Array<{ value: AppealGrounds; label: string; description: string }> {
  return Object.entries(APPEAL_GROUNDS_LABELS).map(([value, label]) => ({
    value: value as AppealGrounds,
    label,
    description: APPEAL_GROUNDS_DESCRIPTIONS[value as AppealGrounds],
  }));
}

/**
 * Get reviewer exclusion list (must not assign to original reviewer)
 */
export function getAvailableReviewers(
  allReviewers: AgentRole[],
  originalReviewerId?: string,
  excludeCurrentAssignee?: string
): AgentRole[] {
  return allReviewers.filter((reviewer) => {
    if (reviewer === originalReviewerId) return false;
    if (reviewer === excludeCurrentAssignee) return false;
    return true;
  });
}
