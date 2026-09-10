/**
 * Feedback Loop System
 * P1 from Benchmark Comparison
 *
 * Human decisions feed back into agent improvement:
 * 1. Human approves/rejects/fixes agent output
 * 2. System captures the feedback signal
 * 3. Pattern detection identifies error categories
 * 4. Agents receive recommendations for improvement
 */

import { AgentRole } from '../types/governance';

export type FeedbackDecision = 'approved' | 'rejected' | 'modified';
export type FeedbackPattern =
  | 'tone_issues'
  | 'factual_error'
  | 'compliance_issue'
  | 'format_error'
  | 'accessibility_missing'
  | 'brand_voice_mismatch'
  | 'legal_risk'
  | 'engagement_low'
  | 'context_missing'
  | 'style_inconsistent'
  | 'other';

export interface FeedbackSignal {
  id: string;
  // Reference
  itemId: string;
  itemTitle: string;
  itemType: 'post' | 'article' | 'reply' | 'image' | 'video' | 'other';

  // Decision
  decision: FeedbackDecision;
  submittedAt: Date;

  // Agent who created
  agentId: AgentRole;
  agentName: string;
  squadId: string;

  // Human who reviewed
  reviewerId: string;
  reviewerName: string;
  reviewedAt: Date;

  // What changed (if modified)
  originalContent?: string;
  modifiedContent?: string;
  changeDescription?: string;

  // Feedback categorization
  pattern: FeedbackPattern;
  patternConfidence: number; // 0-100
  reason: string;

  // Outcome tracking
  wasPublished: boolean;
  publishedAt: Date | null;

  // Learning metrics
  agentAcknowledged: boolean;
  agentAcknowledgedAt: Date | null;
  improvementSuggestion?: string;
}

export interface FeedbackPatternStats {
  pattern: FeedbackPattern;
  count: number;
  percentage: number;
  trend: 'improving' | 'stable' | 'worsening';
  avgResolutionTime: number; // hours
  lastOccurrence: Date | null;
}

export interface AgentFeedbackSummary {
  agentId: AgentRole;
  agentName: string;
  totalFeedback: number;
  approvalRate: number;
  modificationRate: number;
  rejectionRate: number;
  topPatterns: FeedbackPattern[];
  improvementScore: number; // 0-100, higher is better
  lastFeedback: Date | null;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface FeedbackLoopConfig {
  enabled: boolean;
  trackPatterns: boolean;
  notifyAgents: boolean;
  requireAgentAcknowledgment: boolean;
  patternThreshold: number; // confidence threshold for pattern detection
  improvementWindowDays: number; // window for trend calculation
  minSamplesForTrend: number; // minimum feedback count for trend
}

// Default configuration
export const DEFAULT_FEEDBACK_CONFIG: FeedbackLoopConfig = {
  enabled: true,
  trackPatterns: true,
  notifyAgents: true,
  requireAgentAcknowledgment: false,
  patternThreshold: 60,
  improvementWindowDays: 30,
  minSamplesForTrend: 5,
};

// PATTERN LABELS & DESCRIPTIONS
export const FEEDBACK_PATTERN_LABELS: Record<FeedbackPattern, string> = {
  tone_issues: 'Problemas de Tom',
  factual_error: 'Erro Factual',
  compliance_issue: 'Problema de Compliance',
  format_error: 'Erro de Formato',
  accessibility_missing: 'Acessibilidade Ausente',
  brand_voice_mismatch: 'Incompatibilidade com Voz da Marca',
  legal_risk: 'Risco Legal',
  engagement_low: 'Baixo Engajamento',
  context_missing: 'Contexto Ausente',
  style_inconsistent: 'Estilo Inconsistente',
  other: 'Outro',
};

export const FEEDBACK_PATTERN_DESCRIPTIONS: Record<FeedbackPattern, string> = {
  tone_issues: 'O tom não é adequado para o público ou contexto.',
  factual_error: 'Informação incorreta ou imprecisão factual.',
  compliance_issue: 'Violação de políticas ou regulamentos.',
  format_error: 'Erro de formatação, gramática ou ortografia.',
  accessibility_missing: 'Falta de elementos de acessibilidade.',
  brand_voice_mismatch: 'Não соответствует a voz e personalidade da marca.',
  legal_risk: 'Potencial problema jurídico ou regulatório.',
  engagement_low: 'Conteúdo com baixa probabilidade de engajamento.',
  context_missing: 'Falta contexto importante para compreensão.',
  style_inconsistent: 'Não segue o estilo estabelecido.',
  other: 'Outro tipo de problema não categorizado.',
};

export const FEEDBACK_PATTERN_ICONS: Record<FeedbackPattern, string> = {
  tone_issues: '🎭',
  factual_error: '❌',
  compliance_issue: '🛡️',
  format_error: '📝',
  accessibility_missing: '♿',
  brand_voice_mismatch: '🎯',
  legal_risk: '⚖️',
  engagement_low: '📊',
  context_missing: '📋',
  style_inconsistent: '🎨',
  other: '❓',
};

// DECISION LABELS
export const FEEDBACK_DECISION_LABELS: Record<FeedbackDecision, string> = {
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  modified: 'Modificado',
};

/**
 * Calculate approval rate for an agent
 */
export function calculateApprovalRate(feedback: FeedbackSignal[]): number {
  if (feedback.length === 0) return 100;
  const approved = feedback.filter((f) => f.decision === 'approved').length;
  return Math.round((approved / feedback.length) * 100);
}

/**
 * Calculate modification rate
 */
export function calculateModificationRate(feedback: FeedbackSignal[]): number {
  if (feedback.length === 0) return 0;
  const modified = feedback.filter((f) => f.decision === 'modified').length;
  return Math.round((modified / feedback.length) * 100);
}

/**
 * Get top patterns for an agent
 */
export function getTopPatterns(feedback: FeedbackSignal[], limit = 3): FeedbackPattern[] {
  const patternCounts = feedback.reduce((acc, f) => {
    acc[f.pattern] = (acc[f.pattern] || 0) + 1;
    return acc;
  }, {} as Record<FeedbackPattern, number>);

  return Object.entries(patternCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([pattern]) => pattern as FeedbackPattern);
}

/**
 * Calculate improvement score (0-100)
 * Based on recent approval rate vs historical average
 */
export function calculateImprovementScore(
  currentRate: number,
  historicalRate: number,
  feedbackCount: number,
  config: FeedbackLoopConfig
): number {
  if (feedbackCount < config.minSamplesForTrend) {
    return currentRate;
  }

  // Weight improvement based on consistency
  const improvementDelta = currentRate - historicalRate;
  const improvementFactor = improvementDelta > 0 ? 1.1 : improvementDelta < 0 ? 0.9 : 1;

  return Math.min(100, Math.max(0, Math.round(currentRate * improvementFactor)));
}

/**
 * Determine trend based on recent feedback
 */
export function determineTrend(
  feedback: FeedbackSignal[],
  windowDays: number
): 'improving' | 'stable' | 'worsening' {
  if (feedback.length < 3) return 'stable';

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const recentFeedback = feedback.filter(
    (f) => new Date(f.reviewedAt) >= windowStart
  );

  if (recentFeedback.length < 3) return 'stable';

  const recentApprovalRate = calculateApprovalRate(recentFeedback);
  const olderFeedback = feedback.filter(
    (f) => new Date(f.reviewedAt) < windowStart
  );

  if (olderFeedback.length < 3) return 'stable';

  const olderApprovalRate = calculateApprovalRate(olderFeedback);
  const delta = recentApprovalRate - olderApprovalRate;

  if (delta > 10) return 'improving';
  if (delta < -10) return 'worsening';
  return 'stable';
}

/**
 * Generate agent feedback summary
 */
export function generateAgentFeedbackSummary(
  agentId: AgentRole,
  agentName: string,
  feedback: FeedbackSignal[],
  config: FeedbackLoopConfig = DEFAULT_FEEDBACK_CONFIG
): AgentFeedbackSummary {
  const agentFeedback = feedback.filter((f) => f.agentId === agentId);
  const approvalRate = calculateApprovalRate(agentFeedback);
  const modificationRate = calculateModificationRate(agentFeedback);
  const rejectionRate = 100 - approvalRate - modificationRate;
  const topPatterns = getTopPatterns(agentFeedback);
  const improvementScore = calculateImprovementScore(
    approvalRate,
    80, // hypothetical historical average
    agentFeedback.length,
    config
  );
  const trend = determineTrend(agentFeedback, config.improvementWindowDays);

  const lastFeedback = agentFeedback.length > 0
    ? agentFeedback.reduce((latest, f) =>
        new Date(f.reviewedAt) > new Date(latest.reviewedAt) ? f : latest
      )
    : null;

  return {
    agentId,
    agentName,
    totalFeedback: agentFeedback.length,
    approvalRate,
    modificationRate,
    rejectionRate,
    topPatterns,
    improvementScore,
    lastFeedback: lastFeedback ? new Date(lastFeedback.reviewedAt) : null,
    trend,
  };
}

/**
 * Get pattern statistics across all feedback
 */
export function getPatternStats(
  feedback: FeedbackSignal[],
  windowDays: number = 30
): FeedbackPatternStats[] {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const recentFeedback = feedback.filter(
    (f) => new Date(f.reviewedAt) >= windowStart
  );

  const patternCounts = recentFeedback.reduce((acc, f) => {
    acc[f.pattern] = (acc[f.pattern] || 0) + 1;
    return acc;
  }, {} as Record<FeedbackPattern, number>);

  const total = recentFeedback.length || 1;

  return Object.entries(FEEDBACK_PATTERN_LABELS).map(([pattern]) => {
    const patternFeedback = recentFeedback.filter((f) => f.pattern === pattern as FeedbackPattern);
    const count = patternCounts[pattern as FeedbackPattern] || 0;

    // Calculate trend
    const olderFeedback = feedback.filter(
      (f) =>
        f.pattern === pattern &&
        new Date(f.reviewedAt) < windowStart
    );

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (count >= 5 && olderFeedback.length >= 5) {
      const recentRate = count / total;
      const olderRate = olderFeedback.length / feedback.length;
      const delta = recentRate - olderRate;
      if (delta > 0.05) trend = 'worsening'; // more errors = worsening
      if (delta < -0.05) trend = 'improving'; // fewer errors = improving
    }

    // Calculate avg resolution time (mock)
    const avgResolutionTime = 2.5; // hours

    // Last occurrence
    const lastOccurrence = patternFeedback.length > 0
      ? patternFeedback.reduce((latest, f) =>
          new Date(f.reviewedAt) > new Date(latest.reviewedAt) ? f : latest
        )
      : null;

    return {
      pattern: pattern as FeedbackPattern,
      count,
      percentage: Math.round((count / total) * 100),
      trend,
      avgResolutionTime,
      lastOccurrence: lastOccurrence ? new Date(lastOccurrence.reviewedAt) : null,
    };
  }).sort((a, b) => b.count - a.count);
}

/**
 * Create a feedback signal
 */
export function createFeedbackSignal(
  itemId: string,
  itemTitle: string,
  itemType: FeedbackSignal['itemType'],
  decision: FeedbackDecision,
  agentId: AgentRole,
  agentName: string,
  squadId: string,
  reviewerId: string,
  reviewerName: string,
  pattern: FeedbackPattern,
  reason: string,
  options?: {
    originalContent?: string;
    modifiedContent?: string;
    changeDescription?: string;
  }
): FeedbackSignal {
  const now = new Date();

  return {
    id: `feedback-${Date.now()}`,
    itemId,
    itemTitle,
    itemType,
    decision,
    submittedAt: now,
    agentId,
    agentName,
    squadId,
    reviewerId,
    reviewerName,
    reviewedAt: now,
    originalContent: options?.originalContent,
    modifiedContent: options?.modifiedContent,
    changeDescription: options?.changeDescription,
    pattern,
    patternConfidence: 85, // Would be calculated by ML in production
    reason,
    wasPublished: decision === 'approved',
    publishedAt: decision === 'approved' ? now : null,
    agentAcknowledged: false,
    agentAcknowledgedAt: null,
  };
}

/**
 * Get available patterns
 */
export function getAvailablePatterns(): Array<{
  value: FeedbackPattern;
  label: string;
  description: string;
  icon: string;
}> {
  return Object.entries(FEEDBACK_PATTERN_LABELS).map(([value, label]) => ({
    value: value as FeedbackPattern,
    label,
    description: FEEDBACK_PATTERN_DESCRIPTIONS[value as FeedbackPattern],
    icon: FEEDBACK_PATTERN_ICONS[value as FeedbackPattern],
  }));
}
