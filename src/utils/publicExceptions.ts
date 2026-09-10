/**
 * Public Exceptions System
 * P2 from Benchmark Comparison
 *
 * Transparency log for system decisions:
 * - Public exceptions log (accessible to all stakeholders)
 * - Shows when rules are bent or policies modified
 * - Maintains trust through transparency
 */

export type ExceptionType =
  | 'policy_override'
  | 'deadline_extension'
  | 'content_approval'
  | 'feature_bypass'
  | 'emergency_access'
  | 'compliance_waiver'
  | 'other';

export type ExceptionStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked';

export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface PublicException {
  id: string;
  // Reference
  referenceId: string;
  referenceTitle: string;
  referenceType: 'approval' | 'appeal' | 'strike' | 'policy' | 'feature' | 'other';

  // Classification
  type: ExceptionType;
  status: ExceptionStatus;
  severity: ExceptionSeverity;

  // Details
  title: string;
  description: string;
  justification: string;
  businessImpact: string;
  riskAssessment: string;

  // Who & When
  requestedBy: string;
  requestedByRole: string;
  requestedAt: Date;

  // Approval
  approvedBy: string | null;
  approvedAt: Date | null;
  approvalNotes: string | null;

  // Conditions (if approved)
  conditions: string[];
  monitoringRequired: boolean;
  expirationDate: Date | null;

  // Transparency
  isPublic: boolean;
  stakeholderNotification: boolean;
  stakeholderNotificationDate: Date | null;

  // Impact tracking
  impactMetrics: {
    affectedContent: number;
    affectedTime: number; // hours
    revenueImpact?: string;
    reputationRisk: 'none' | 'low' | 'medium' | 'high';
  };

  // Resolution
  resolvedAt: Date | null;
  resolutionNotes: string | null;
  lessonsLearned: string | null;

  // Metadata
  tags: string[];
  relatedExceptions: string[]; // IDs
}

// EXCEPTION TYPE LABELS
export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  policy_override: 'Override de Política',
  deadline_extension: 'Extensão de Prazo',
  content_approval: 'Aprovação de Conteúdo',
  feature_bypass: 'Bypass de Feature',
  emergency_access: 'Acesso de Emergência',
  compliance_waiver: 'Dispensa de Compliance',
  other: 'Outro',
};

export const EXCEPTION_TYPE_DESCRIPTIONS: Record<ExceptionType, string> = {
  policy_override: 'Override de uma política padrão do sistema',
  deadline_extension: 'Extensão do prazo padrão de revisão/aprovação',
  content_approval: 'Aprovação de conteúdo fora dos parâmetros normais',
  feature_bypass: 'Bypass de uma feature ou controle de segurança',
  emergency_access: 'Acesso de emergência a sistemas ou dados',
  compliance_waiver: 'Dispensa temporária de requisito de compliance',
  other: 'Outro tipo de exceção',
};

export const EXCEPTION_TYPE_ICONS: Record<ExceptionType, string> = {
  policy_override: '⚡',
  deadline_extension: '⏰',
  content_approval: '✅',
  feature_bypass: '🔓',
  emergency_access: '🚨',
  compliance_waiver: '🛡️',
  other: '❓',
};

// SEVERITY LABELS
export const SEVERITY_LABELS: Record<ExceptionSeverity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export const SEVERITY_COLORS: Record<ExceptionSeverity, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

// STATUS LABELS
export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  expired: 'Expirada',
  revoked: 'Revogada',
};

/**
 * Get available exception types
 */
export function getAvailableExceptionTypes(): Array<{
  value: ExceptionType;
  label: string;
  description: string;
  icon: string;
}> {
  return Object.entries(EXCEPTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as ExceptionType,
    label,
    description: EXCEPTION_TYPE_DESCRIPTIONS[value as ExceptionType],
    icon: EXCEPTION_TYPE_ICONS[value as ExceptionType],
  }));
}

/**
 * Create a new public exception
 */
export function createPublicException(
  referenceId: string,
  referenceTitle: string,
  referenceType: PublicException['referenceType'],
  type: ExceptionType,
  title: string,
  description: string,
  justification: string,
  requestedBy: string,
  requestedByRole: string,
  severity: ExceptionSeverity = 'medium',
  options?: {
    businessImpact?: string;
    riskAssessment?: string;
    conditions?: string[];
    monitoringRequired?: boolean;
    expirationDate?: Date;
    tags?: string[];
  }
): PublicException {
  const now = new Date();

  return {
    id: `exception-${Date.now()}`,
    referenceId,
    referenceTitle,
    referenceType,
    type,
    status: 'pending',
    severity,
    title,
    description,
    justification,
    businessImpact: options?.businessImpact || 'Não mensurado',
    riskAssessment: options?.riskAssessment || 'Não avaliado',
    requestedBy,
    requestedByRole,
    requestedAt: now,
    approvedBy: null,
    approvedAt: null,
    approvalNotes: null,
    conditions: options?.conditions || [],
    monitoringRequired: options?.monitoringRequired || false,
    expirationDate: options?.expirationDate || null,
    isPublic: true,
    stakeholderNotification: false,
    stakeholderNotificationDate: null,
    impactMetrics: {
      affectedContent: 0,
      affectedTime: 0,
      revenueImpact: undefined,
      reputationRisk: 'low',
    },
    resolvedAt: null,
    resolutionNotes: null,
    lessonsLearned: null,
    tags: options?.tags || [],
    relatedExceptions: [],
  };
}

/**
 * Calculate exception risk score
 */
export function calculateExceptionRisk(exception: PublicException): number {
  // Base score from severity
  const severityScores = { low: 10, medium: 30, high: 60, critical: 90 };
  let score = severityScores[exception.severity];

  // Add points for monitoring requirements
  if (exception.monitoringRequired) score += 5;

  // Add points for stakeholder notification delay
  if (exception.stakeholderNotification && !exception.stakeholderNotificationDate) {
    score += 10;
  }

  // Add points for unresolved exceptions
  if (!exception.resolvedAt) score += 5;

  // Cap at 100
  return Math.min(100, score);
}

/**
 * Check if exception is active
 */
export function isExceptionActive(exception: PublicException): boolean {
  if (exception.status !== 'approved') return false;
  if (exception.expirationDate && new Date(exception.expirationDate) < new Date()) {
    return false;
  }
  return true;
}

/**
 * Get exception age in days
 */
export function getExceptionAge(exception: PublicException): number {
  const now = new Date();
  const requested = new Date(exception.requestedAt);
  const diff = now.getTime() - requested.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get time until expiration
 */
export function getTimeUntilExpiration(exception: PublicException): number | null {
  if (!exception.expirationDate) return null;
  const now = new Date();
  const expiration = new Date(exception.expirationDate);
  const diff = expiration.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
