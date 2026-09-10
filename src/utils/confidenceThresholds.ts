/**
 * AI Confidence Threshold System
 * P0 from Benchmark Comparison
 *
 * Adjustable threshold per validation type:
 * - autoApproveAbove: confidence >= this → auto-approve
 * - requireHumanBetween: range → require human approval
 * - autoBlockBelow: confidence <= this → auto-block
 */

export type ValidationType =
  | 'compliance'
  | 'facts'
  | 'format'
  | 'accessibility'
  | 'brand_voice'
  | 'legal_risk'
  | 'tone'
  | 'engagement_potential';

export interface ConfidenceThreshold {
  type: ValidationType;
  label: string;
  description: string;
  // All values 0-100
  autoApproveAbove: number;
  requireHumanBetween: [number, number];
  autoBlockBelow: number;
  enabled: boolean;
  // Weights for combined score
  weight: number;
  icon: string;
}

export interface ValidationResult {
  type: ValidationType;
  confidence: number; // 0-100
  issues: string[];
  details?: string;
}

export interface ThresholdEvaluation {
  result: 'auto_approved' | 'requires_human' | 'auto_blocked';
  recommendation: string;
  color: string;
  thresholds: ConfidenceThreshold;
  confidence: number;
}

// Default thresholds based on best practices from Big Tech
export const DEFAULT_THRESHOLDS: Record<ValidationType, ConfidenceThreshold> = {
  compliance: {
    type: 'compliance',
    label: 'Compliance',
    description: 'Conformidade legal e regulatória (LGPD, GDPR, etc.)',
    autoApproveAbove: 95,
    requireHumanBetween: [70, 95],
    autoBlockBelow: 70,
    enabled: true,
    weight: 0.25,
    icon: '🛡️',
  },
  facts: {
    type: 'facts',
    label: 'Factualidade',
    description: 'Veracidade das informações e claims',
    autoApproveAbove: 90,
    requireHumanBetween: [65, 90],
    autoBlockBelow: 65,
    enabled: true,
    weight: 0.25,
    icon: '✓',
  },
  format: {
    type: 'format',
    label: 'Formato',
    description: 'Estrutura, gramática, ortografia',
    autoApproveAbove: 99,
    requireHumanBetween: [85, 99],
    autoBlockBelow: 85,
    enabled: true,
    weight: 0.10,
    icon: '📝',
  },
  accessibility: {
    type: 'accessibility',
    label: 'Acessibilidade',
    description: 'Alt text, contraste, leitura facilitada',
    autoApproveAbove: 85,
    requireHumanBetween: [60, 85],
    autoBlockBelow: 60,
    enabled: true,
    weight: 0.10,
    icon: '♿',
  },
  brand_voice: {
    type: 'brand_voice',
    label: 'Voz da Marca',
    description: 'Tom, vocabulário, personalidade',
    autoApproveAbove: 88,
    requireHumanBetween: [70, 88],
    autoBlockBelow: 70,
    enabled: true,
    weight: 0.10,
    icon: '🎯',
  },
  legal_risk: {
    type: 'legal_risk',
    label: 'Risco Legal',
    description: 'Possíveis problemas jurídicos ou regulatórios',
    autoApproveAbove: 92,
    requireHumanBetween: [75, 92],
    autoBlockBelow: 75,
    enabled: true,
    weight: 0.10,
    icon: '⚖️',
  },
  tone: {
    type: 'tone',
    label: 'Tom',
    description: 'Adequação ao contexto e audiência',
    autoApproveAbove: 87,
    requireHumanBetween: [65, 87],
    autoBlockBelow: 65,
    enabled: true,
    weight: 0.05,
    icon: '🎭',
  },
  engagement_potential: {
    type: 'engagement_potential',
    label: 'Potencial de Engajamento',
    description: 'Probabilidade de gerar interação',
    autoApproveAbove: 80,
    requireHumanBetween: [50, 80],
    autoBlockBelow: 50,
    enabled: false, // Disabled by default - less critical
    weight: 0.05,
    icon: '📊',
  },
};

/**
 * Evaluate a validation result against thresholds
 */
export function evaluateAgainstThresholds(
  result: ValidationResult,
  thresholds: ConfidenceThreshold = DEFAULT_THRESHOLDS[result.type]
): ThresholdEvaluation {
  const { confidence } = result;
  const { autoApproveAbove, requireHumanBetween, autoBlockBelow } = thresholds;
  const [humanMin, humanMax] = requireHumanBetween;

  let evaluation: ThresholdEvaluation['result'];
  let recommendation: string;
  let color: string;

  if (confidence >= autoApproveAbove) {
    evaluation = 'auto_approved';
    recommendation = `Auto-aprovado: confiança ${confidence}% ≥ ${autoApproveAbove}%`;
    color = '#22c55e';
  } else if (confidence <= autoBlockBelow) {
    evaluation = 'auto_blocked';
    recommendation = `Bloqueado: confiança ${confidence}% ≤ ${autoBlockBelow}%`;
    color = '#ef4444';
  } else {
    evaluation = 'requires_human';
    recommendation = `Requer aprovação humana (entre ${humanMin}% e ${humanMax}%)`;
    color = '#fbbf24';
  }

  return {
    result: evaluation,
    recommendation,
    color,
    thresholds,
    confidence,
  };
}

/**
 * Calculate combined confidence score from multiple validation results
 */
export function calculateCombinedConfidence(results: ValidationResult[]): number {
  if (results.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  results.forEach((result) => {
    const threshold = DEFAULT_THRESHOLDS[result.type];
    if (!threshold.enabled) return;

    weightedSum += result.confidence * threshold.weight;
    totalWeight += threshold.weight;
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Get aggregated decision from all validation results
 * Returns the most restrictive decision
 */
export function getAggregatedDecision(
  results: ValidationResult[]
): 'auto_approved' | 'requires_human' | 'auto_blocked' {
  const evaluations = results.map((r) => evaluateAgainstThresholds(r));

  // If any is blocked, aggregate is blocked
  if (evaluations.some((e) => e.result === 'auto_blocked')) {
    return 'auto_blocked';
  }

  // If any requires human, aggregate requires human
  if (evaluations.some((e) => e.result === 'requires_human')) {
    return 'requires_human';
  }

  // All approved
  return 'auto_approved';
}

/**
 * Get color for a decision
 */
export function getDecisionColor(decision: 'auto_approved' | 'requires_human' | 'auto_blocked'): string {
  switch (decision) {
    case 'auto_approved':
      return '#22c55e';
    case 'requires_human':
      return '#fbbf24';
    case 'auto_blocked':
      return '#ef4444';
  }
}

/**
 * Get label for a decision
 */
export function getDecisionLabel(decision: 'auto_approved' | 'requires_human' | 'auto_blocked'): string {
  switch (decision) {
    case 'auto_approved':
      return 'Auto-aprovado';
    case 'requires_human':
      return 'Requer Humano';
    case 'auto_blocked':
      return 'Auto-bloqueado';
  }
}

/**
 * Get icon for a decision
 */
export function getDecisionIcon(decision: 'auto_approved' | 'requires_human' | 'auto_blocked'): string {
  switch (decision) {
    case 'auto_approved':
      return '✅';
    case 'requires_human':
      return '👤';
    case 'auto_blocked':
      return '🚫';
  }
}

/**
 * Suggest threshold adjustments based on recent decisions
 * Returns recommended changes to optimize auto-approval rate
 */
export function suggestThresholdAdjustments(
  results: { confidence: number; type: ValidationType; decision: 'auto_approved' | 'requires_human' | 'auto_blocked' }[]
): { type: ValidationType; currentThreshold: number; suggestedThreshold: number; reason: string }[] {
  const suggestions: { type: ValidationType; currentThreshold: number; suggestedThreshold: number; reason: string }[] = [];

  // Group by type
  const byType = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<ValidationType, typeof results>);

  Object.entries(byType).forEach(([type, items]) => {
    const threshold = DEFAULT_THRESHOLDS[type as ValidationType];
    const blockedCount = items.filter((i) => i.decision === 'auto_blocked').length;
    const humanCount = items.filter((i) => i.decision === 'requires_human').length;

    // If too many human reviews (>70%), suggest lower autoApproveAbove
    if (humanCount / items.length > 0.7) {
      suggestions.push({
        type: type as ValidationType,
        currentThreshold: threshold.autoApproveAbove,
        suggestedThreshold: Math.max(threshold.autoApproveAbove - 5, threshold.autoBlockBelow + 10),
        reason: `${Math.round((humanCount / items.length) * 100)}% das validações requerem humano. Threshold muito restritivo.`,
      });
    }

    // If too many blocks (>30%), suggest raising autoBlockBelow
    if (blockedCount / items.length > 0.3) {
      suggestions.push({
        type: type as ValidationType,
        currentThreshold: threshold.autoBlockBelow,
        suggestedThreshold: Math.max(threshold.autoBlockBelow - 10, 50),
        reason: `${Math.round((blockedCount / items.length) * 100)}% das validações são bloqueadas. Threshold muito permissivo.`,
      });
    }
  });

  return suggestions;
}
