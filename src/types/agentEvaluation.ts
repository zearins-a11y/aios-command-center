/**
 * Agent Evaluation Types
 * For the "Evaluation Panel" - assesses gaps, redundancies, and integration needs
 * across all agent sources (local, github, AIOS, XQuads, agency-agents, etc.)
 */

export type AgentSource = 'local' | 'github' | 'aios' | 'xquads' | 'agency-agents' | 'external';
export type AgentCategory =
  | 'sales'
  | 'marketing'
  | 'design'
  | 'engineering'
  | 'data'
  | 'support'
  | 'operations'
  | 'finance'
  | 'legal'
  | 'strategy'
  | 'creative'
  | 'other';

export type AgentStatus =
  | 'needed'         // gap - precisamos desse
  | 'have_it'        // já temos um equivalente
  | 'duplicate'      // duplica algo existente
  | 'redundant'      // redundante após consolidação
  | 'tbd';           // precisa avaliação

export type Recommendation =
  | 'integrate_now'        // integrar imediatamente
  | 'integrate_later'      // útil, mas não prioritário
  | 'replace_existing'     // substitui algo que temos
  | 'consolidate'          // consolidar com existente
  | 'skip';                // não vale a pena

/**
 * Evaluated agent record
 */
export interface AgentEvaluation {
  id: string;
  name: string;
  source: AgentSource;
  sourcePath?: string;       // file path or URL
  category: AgentCategory;
  description: string;
  capabilities: string[];

  // Evaluation scores (0-100)
  fitWithAios: number;       // encaixe com AIOS framework
  fitWithXquads: number;     // encaixe com XQuads squads
  reusability: number;       // quão reusável é o código/padrão
  businessValue: number;     // valor de negócio esperado
  maintenanceCost: number;   // inverso - 0 = caro, 100 = barato

  // Decision
  status: AgentStatus;
  recommendation: Recommendation;
  reasoning: string;

  // Action plan
  integrationSteps?: string[];
  migrationPath?: string;
  estimatedHours?: number;

  // Tracking
  evaluatedAt: Date;
  evaluatedBy: string;
  tags?: string[];
}

/**
 * Evaluation criteria weights for final score calculation
 */
export const EVALUATION_WEIGHTS = {
  fitWithAios: 0.20,
  fitWithXquads: 0.15,
  reusability: 0.20,
  businessValue: 0.30,
  maintenanceCost: 0.15,
} as const;

/**
 * Calculate overall score from evaluation dimensions
 */
export function calculateOverallScore(evaluation: Omit<AgentEvaluation, 'id' | 'status' | 'recommendation' | 'reasoning'>): number {
  return Math.round(
    evaluation.fitWithAios * EVALUATION_WEIGHTS.fitWithAios +
    evaluation.fitWithXquads * EVALUATION_WEIGHTS.fitWithXquads +
    evaluation.reusability * EVALUATION_WEIGHTS.reusability +
    evaluation.businessValue * EVALUATION_WEIGHTS.businessValue +
    evaluation.maintenanceCost * EVALUATION_WEIGHTS.maintenanceCost
  );
}

/**
 * Get priority level from overall score
 */
export function getPriorityFromScore(score: number): 'critical' | 'high' | 'medium' | 'low' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Source display info
 */
export const SOURCE_INFO: Record<AgentSource, { label: string; color: string; icon: string }> = {
  local: { label: 'Local', color: '#06b6d4', icon: '💻' },
  github: { label: 'GitHub', color: '#8b5cf6', icon: '🔗' },
  aios: { label: 'AIOS', color: '#22c55e', icon: '🤖' },
  xquads: { label: 'XQuads', color: '#f59e0b', icon: '⚡' },
  'agency-agents': { label: 'Agency Agents', color: '#ec4899', icon: '🎯' },
  external: { label: 'External', color: '#94a3b8', icon: '🌐' },
};

/**
 * Recommendation display info
 */
export const RECOMMENDATION_INFO: Record<Recommendation, { label: string; color: string; icon: string }> = {
  integrate_now: { label: 'Integrar Agora', color: '#22c55e', icon: '✅' },
  integrate_later: { label: 'Integrar Depois', color: '#3b82f6', icon: '⏰' },
  replace_existing: { label: 'Substituir Existente', color: '#f97316', icon: '🔄' },
  consolidate: { label: 'Consolidar', color: '#a855f7', icon: '🔗' },
  skip: { label: 'Pular', color: '#64748b', icon: '❌' },
};

/**
 * Filter helpers
 */
export interface AgentFilters {
  sources?: AgentSource[];
  categories?: AgentCategory[];
  statuses?: AgentStatus[];
  recommendations?: Recommendation[];
  minScore?: number;
  searchQuery?: string;
}

export function filterEvaluations(
  evaluations: AgentEvaluation[],
  filters: AgentFilters
): AgentEvaluation[] {
  return evaluations.filter((evaluation) => {
    if (filters.sources?.length && !filters.sources.includes(evaluation.source)) {
      return false;
    }
    if (filters.categories?.length && !filters.categories.includes(evaluation.category)) {
      return false;
    }
    if (filters.statuses?.length && !filters.statuses.includes(evaluation.status)) {
      return false;
    }
    if (filters.recommendations?.length && !filters.recommendations.includes(evaluation.recommendation)) {
      return false;
    }
    if (filters.minScore !== undefined) {
      const overallScore = calculateOverallScore(evaluation);
      if (overallScore < filters.minScore) return false;
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matches =
        evaluation.name.toLowerCase().includes(query) ||
        evaluation.description.toLowerCase().includes(query) ||
        evaluation.capabilities.some((c) => c.toLowerCase().includes(query));
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Summary statistics
 */
export interface EvaluationSummary {
  totalAgents: number;
  bySource: Record<AgentSource, number>;
  byCategory: Record<AgentCategory, number>;
  byStatus: Record<AgentStatus, number>;
  byRecommendation: Record<Recommendation, number>;
  averageScore: number;
  criticalGaps: number;        // status === 'needed' with high score
  integrationQueueLength: number;
  totalEstimatedHours: number;
}

export function summarizeEvaluations(evaluations: AgentEvaluation[]): EvaluationSummary {
  const bySource: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byRecommendation: Record<string, number> = {};

  let totalScore = 0;
  let criticalGaps = 0;
  let totalEstimatedHours = 0;
  let integrationQueueLength = 0;

  evaluations.forEach((evaluation) => {
    bySource[evaluation.source] = (bySource[evaluation.source] || 0) + 1;
    byCategory[evaluation.category] = (byCategory[evaluation.category] || 0) + 1;
    byStatus[evaluation.status] = (byStatus[evaluation.status] || 0) + 1;
    byRecommendation[evaluation.recommendation] = (byRecommendation[evaluation.recommendation] || 0) + 1;

    const score = calculateOverallScore(evaluation);
    totalScore += score;

    if (evaluation.status === 'needed' && score >= 60) criticalGaps++;
    if (evaluation.recommendation === 'integrate_now' || evaluation.recommendation === 'replace_existing') {
      integrationQueueLength++;
    }
    if (evaluation.estimatedHours) totalEstimatedHours += evaluation.estimatedHours;
  });

  return {
    totalAgents: evaluations.length,
    bySource: bySource as Record<AgentSource, number>,
    byCategory: byCategory as Record<AgentCategory, number>,
    byStatus: byStatus as Record<AgentStatus, number>,
    byRecommendation: byRecommendation as Record<Recommendation, number>,
    averageScore: evaluations.length > 0 ? Math.round(totalScore / evaluations.length) : 0,
    criticalGaps,
    integrationQueueLength,
    totalEstimatedHours,
  };
}
