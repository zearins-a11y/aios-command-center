/**
 * System Health Metrics
 * P2 from Benchmark Comparison
 *
 * Dashboard for monitoring AI agent system health:
 * - Approval queue metrics
 * - Strike system stats
 * - Threshold effectiveness
 * - Appeal resolution rates
 * - Exception trends
 */

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: HealthStatus;
  description: string;
}

export interface HealthCheck {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  lastChecked: Date;
  message: string;
}

export interface HealthTrend {
  date: Date;
  metrics: {
    approvalsProcessed: number;
    avgResolutionTime: number;
    strikeRate: number;
    thresholdAccuracy: number;
    appealApprovalRate: number;
    exceptionRate: number;
  };
}

// METRIC DEFINITIONS
export const METRIC_DEFINITIONS = {
  approvalsProcessed: {
    name: 'Aprovações Processadas',
    unit: 'dia',
    target: 50,
    description: 'Número de aprovações processadas por dia',
  },
  avgResolutionTime: {
    name: 'Tempo Médio de Resolução',
    unit: 'minutos',
    target: 60,
    description: 'Tempo médio para resolver uma aprovação',
  },
  strikeRate: {
    name: 'Taxa de Strikes',
    unit: '%',
    target: 5,
    description: 'Porcentagem de agentes com strikes ativos',
  },
  thresholdAccuracy: {
    name: 'Precisão dos Thresholds',
    unit: '%',
    target: 90,
    description: 'Percentual de decisões que seguem os thresholds configurados',
  },
  appealApprovalRate: {
    name: 'Taxa de Aprovação de Recursos',
    unit: '%',
    target: 30,
    description: 'Percentual de recursos que são aprovados',
  },
  exceptionRate: {
    name: 'Taxa de Exceções',
    unit: '%',
    target: 5,
    description: 'Percentual de aprovações que geram exceções',
  },
  humanReviewRate: {
    name: 'Taxa de Revisão Humana',
    unit: '%',
    target: 20,
    description: 'Percentual de aprovações que requerem revisão humana',
  },
  autoApprovalRate: {
    name: 'Taxa de Auto-Aprovação',
    unit: '%',
    target: 70,
    description: 'Percentual de aprovações automáticas',
  },
};

// HEALTH STATUS THRESHOLDS
export function getHealthStatus(value: number, target: number, lowerIsBetter = false): HealthStatus {
  if (lowerIsBetter) {
    if (value <= target * 0.5) return 'healthy';
    if (value <= target * 1.5) return 'warning';
    return 'critical';
  }

  if (value >= target * 0.9) return 'healthy';
  if (value >= target * 0.7) return 'warning';
  return 'critical';
}

export function getStatusColor(status: HealthStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'healthy':
      return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' };
    case 'warning':
      return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    case 'critical':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
  }
}

export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
}

export function getTrendColor(trend: 'up' | 'down' | 'stable', lowerIsBetter = false): string {
  if (trend === 'stable') return 'text-gray-400';

  if (lowerIsBetter) {
    return trend === 'down' ? 'text-green-400' : 'text-red-400';
  }

  return trend === 'up' ? 'text-green-400' : 'text-red-400';
}

/**
 * Calculate overall health score
 */
export function calculateHealthScore(metrics: HealthMetric[]): number {
  if (metrics.length === 0) return 100;

  const weights = {
    healthy: 100,
    warning: 60,
    critical: 20,
  };

  const totalWeight = metrics.reduce((sum, m) => {
    const deviation = Math.abs(m.value - m.target) / m.target;
    const weight = deviation > 1 ? 2 : 1;
    return sum + weight;
  }, 0);

  const weightedSum = metrics.reduce((sum, m) => {
    const deviation = Math.abs(m.value - m.target) / m.target;
    const weight = deviation > 1 ? 2 : 1;
    return sum + weights[m.status] * weight;
  }, 0);

  return Math.round(weightedSum / totalWeight);
}

/**
 * Generate mock trend data
 */
export function generateTrendData(days: number = 30): HealthTrend[] {
  const trends: HealthTrend[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some randomness but keep trends somewhat consistent
    const dayVariation = Math.sin(i / 5) * 10;

    trends.push({
      date,
      metrics: {
        approvalsProcessed: 40 + Math.round(Math.random() * 20 + dayVariation),
        avgResolutionTime: 45 + Math.round(Math.random() * 30),
        strikeRate: 3 + Math.round(Math.random() * 4),
        thresholdAccuracy: 85 + Math.round(Math.random() * 15),
        appealApprovalRate: 25 + Math.round(Math.random() * 20),
        exceptionRate: 3 + Math.round(Math.random() * 4),
      },
    });
  }

  return trends;
}

/**
 * Get health checks
 */
export function getHealthChecks(
  metrics: HealthMetric[],
  pendingApprovals: number,
  activeStrikes: number
): HealthCheck[] {
  const checks: HealthCheck[] = [];
  const now = new Date();

  // Check pending approvals
  checks.push({
    id: 'check-pending',
    name: 'Fila de Aprovações',
    status: pendingApprovals > 20 ? 'warning' : 'pass',
    lastChecked: now,
    message:
      pendingApprovals > 20
        ? `${pendingApprovals} aprovações pendentes - considere adicionar revisores`
        : 'Fila de aprovações dentro do normal',
  });

  // Check strikes
  checks.push({
    id: 'check-strikes',
    name: 'Sistema de Strikes',
    status: activeStrikes > 5 ? 'warning' : 'pass',
    lastChecked: now,
    message:
      activeStrikes > 5
        ? `${activeStrikes} strikes ativos - monitoramento necessário`
        : 'Sistema de strikes estável',
  });

  // Check threshold accuracy
  const thresholdMetric = metrics.find((m) => m.id === 'thresholdAccuracy');
  if (thresholdMetric) {
    checks.push({
      id: 'check-threshold',
      name: 'Precisão dos Thresholds',
      status: thresholdMetric.status === 'healthy' ? 'pass' : thresholdMetric.status === 'warning' ? 'warning' : 'fail',
      lastChecked: now,
      message: `${thresholdMetric.value}% de precisão - ${thresholdMetric.description}`,
    });
  }

  // Check approval rate
  const approvalMetric = metrics.find((m) => m.id === 'autoApprovalRate');
  if (approvalMetric) {
    checks.push({
      id: 'check-approval',
      name: 'Taxa de Auto-Aprovação',
      status: approvalMetric.status === 'healthy' ? 'pass' : approvalMetric.status === 'warning' ? 'warning' : 'fail',
      lastChecked: now,
      message: `${approvalMetric.value}% auto-aprovado - Meta: ${approvalMetric.target}%`,
    });
  }

  return checks;
}

/**
 * Get overall health status
 */
export function getOverallHealthStatus(score: number): {
  status: HealthStatus;
  label: string;
  color: string;
  icon: string;
} {
  if (score >= 80) {
    return {
      status: 'healthy',
      label: 'Saúdo',
      color: '#22c55e',
      icon: '✅',
    };
  }
  if (score >= 50) {
    return {
      status: 'warning',
      label: 'Atenção',
      color: '#fbbf24',
      icon: '⚠️',
    };
  }
  return {
    status: 'critical',
    label: 'Crítico',
    color: '#ef4444',
    icon: '🚨',
  };
}
