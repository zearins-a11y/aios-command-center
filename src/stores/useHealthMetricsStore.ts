import { create } from 'zustand';
import {
  HealthMetric,
  HealthCheck,
  HealthTrend,
  getHealthStatus,
  calculateHealthScore,
  generateTrendData,
  getHealthChecks,
  getOverallHealthStatus,
} from '../utils/healthMetrics';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface HealthMetricsStore {
  // Data
  metrics: HealthMetric[];
  trends: HealthTrend[];
  healthChecks: HealthCheck[];

  // Stats from other stores (simulated)
  pendingApprovals: number;
  activeStrikes: number;

  // Actions
  refreshMetrics: () => void;
  updateMetric: (metricId: string, value: number) => void;
  setPendingApprovals: (count: number) => void;
  setActiveStrikes: (count: number) => void;

  // Queries
  getMetric: (metricId: string) => HealthMetric | undefined;
  getOverallScore: () => number;
  getOverallStatus: () => ReturnType<typeof getOverallHealthStatus>;
  getFilteredTrends: (days: number) => HealthTrend[];

  // Supabase integration
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

export const useHealthMetricsStore = create<HealthMetricsStore>((set, get) => ({
  metrics: [
    {
      id: 'approvalsProcessed',
      name: 'Aprovações Processadas',
      value: 47,
      target: 50,
      unit: 'dia',
      trend: 'up',
      status: 'healthy',
      description: 'Número de aprovações processadas por dia',
    },
    {
      id: 'avgResolutionTime',
      name: 'Tempo Médio de Resolução',
      value: 45,
      target: 60,
      unit: 'minutos',
      trend: 'down',
      status: 'healthy',
      description: 'Tempo médio para resolver uma aprovação',
    },
    {
      id: 'strikeRate',
      name: 'Taxa de Strikes',
      value: 4,
      target: 5,
      unit: '%',
      trend: 'stable',
      status: 'healthy',
      description: 'Porcentagem de agentes com strikes ativos',
    },
    {
      id: 'thresholdAccuracy',
      name: 'Precisão dos Thresholds',
      value: 92,
      target: 90,
      unit: '%',
      trend: 'up',
      status: 'healthy',
      description: 'Percentual de decisões que seguem os thresholds',
    },
    {
      id: 'appealApprovalRate',
      name: 'Taxa de Aprovação de Recursos',
      value: 28,
      target: 30,
      unit: '%',
      trend: 'stable',
      status: 'healthy',
      description: 'Percentual de recursos que são aprovados',
    },
    {
      id: 'exceptionRate',
      name: 'Taxa de Exceções',
      value: 6,
      target: 5,
      unit: '%',
      trend: 'up',
      status: 'warning',
      description: 'Percentual de aprovações que geram exceções',
    },
    {
      id: 'humanReviewRate',
      name: 'Taxa de Revisão Humana',
      value: 18,
      target: 20,
      unit: '%',
      trend: 'down',
      status: 'healthy',
      description: 'Percentual de aprovações que requerem revisão humana',
    },
    {
      id: 'autoApprovalRate',
      name: 'Taxa de Auto-Aprovação',
      value: 75,
      target: 70,
      unit: '%',
      trend: 'up',
      status: 'healthy',
      description: 'Percentual de aprovações automáticas',
    },
  ],

  trends: generateTrendData(30),

  healthChecks: [],

  pendingApprovals: 12,
  activeStrikes: 2,

  refreshMetrics: () => {
    const { metrics, pendingApprovals, activeStrikes } = get();

    // Recalculate statuses
    const updatedMetrics = metrics.map((metric) => {
      const lowerIsBetter = metric.id === 'avgResolutionTime' || metric.id === 'strikeRate' || metric.id === 'exceptionRate';
      const status = getHealthStatus(metric.value, metric.target, lowerIsBetter);

      // Calculate trend
      const trends = get().trends;
      if (trends.length >= 2) {
        const recent = trends[trends.length - 1].metrics[metric.id as keyof typeof trends[0]['metrics']];
        const previous = trends[trends.length - 7].metrics[metric.id as keyof typeof trends[0]['metrics']];

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (recent > previous * 1.05) trend = 'up';
        else if (recent < previous * 0.95) trend = 'down';

        return { ...metric, status, trend };
      }

      return { ...metric, status };
    });

    // Update health checks
    const healthChecks = getHealthChecks(updatedMetrics, pendingApprovals, activeStrikes);

    set({ metrics: updatedMetrics, healthChecks });
  },

  updateMetric: (metricId, value) => {
    set((state) => ({
      metrics: state.metrics.map((m) =>
        m.id === metricId
          ? {
              ...m,
              value,
              status: getHealthStatus(
                value,
                m.target,
                m.id === 'avgResolutionTime' || m.id === 'strikeRate' || m.id === 'exceptionRate'
              ),
            }
          : m
      ),
    }));
  },

  setPendingApprovals: (count) => {
    set({ pendingApprovals: count });
    get().refreshMetrics();
  },

  setActiveStrikes: (count) => {
    set({ activeStrikes: count });
    get().refreshMetrics();
  },

  getMetric: (metricId) => {
    return get().metrics.find((m) => m.id === metricId);
  },

  getOverallScore: () => {
    const metrics = get().metrics;
    return calculateHealthScore(metrics);
  },

  getOverallStatus: () => {
    const score = get().getOverallScore();
    return getOverallHealthStatus(score);
  },

  getFilteredTrends: (days) => {
    const trends = get().trends;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return trends.filter((t) => t.date >= cutoff);
  },

  loadFromSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('health_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        const loadedTrends: HealthTrend[] = data.map((db: any) => ({
          date: new Date(db.date),
          score: db.score || 0,
          metrics: db.metrics || {},
        }));
        set({ trends: loadedTrends });
      }
    } catch (error) {
      console.error('Failed to load health metrics from Supabase:', error);
    }
  },

  syncToSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { metrics } = get();
    try {
      // Sync current metrics
      const score = calculateHealthScore(metrics);
      const currentMetrics: Record<string, number> = {};
      metrics.forEach((m) => {
        currentMetrics[m.id] = m.value;
      });

      await supabase.from('health_metrics').insert({
        date: new Date().toISOString(),
        score,
        metrics: currentMetrics,
      });
    } catch (error) {
      console.error('Failed to sync health metrics to Supabase:', error);
    }
  },
}));

// Initialize health checks on load
const store = useHealthMetricsStore.getState();
store.refreshMetrics();
