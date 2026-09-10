import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Shield,
  BarChart3,
} from 'lucide-react';
import { useHealthMetricsStore } from '../../stores/useHealthMetricsStore';
import {
  HealthMetric,
  getStatusColor,
  getTrendColor,
} from '../../utils/healthMetrics';

// Metric Card Component
function MetricCard({ metric }: { metric: HealthMetric }) {
  const colors = getStatusColor(metric.status);
  const trendColor = getTrendColor(metric.trend, metric.id === 'avgResolutionTime' || metric.id === 'strikeRate' || metric.id === 'exceptionRate');

  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">{metric.name}</span>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={12} />
          <span className="text-xs">{metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className={`text-2xl font-bold ${colors.text}`}>{metric.value}</span>
          <span className="text-sm text-text-muted ml-1">{metric.unit}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-dim">Meta: </span>
          <span className="text-xs font-medium text-text-muted">{metric.target}</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (metric.value / metric.target) * 100)}%`,
            backgroundColor: colors.text.replace('text-', '').includes('green')
              ? '#22c55e'
              : colors.text.replace('text-', '').includes('yellow')
              ? '#fbbf24'
              : '#ef4444',
          }}
        />
      </div>
    </motion.div>
  );
}

// Health Check Item
function HealthCheckItem({ check }: { check: { name: string; status: string; message: string; lastChecked: Date } }) {
  const statusConfig = {
    pass: { icon: <CheckCircle2 size={16} />, color: 'text-green-400', bg: 'bg-green-500/10' },
    warning: { icon: <AlertTriangle size={16} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    fail: { icon: <XCircle size={16} />, color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  const config = statusConfig[check.status as keyof typeof statusConfig];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${config.bg}`}>
      <div className={config.color}>{config.icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">{check.name}</div>
        <div className="text-xs text-text-muted mt-0.5">{check.message}</div>
      </div>
      <div className="text-xs text-text-dim">
        {new Date(check.lastChecked).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

// Mini Trend Chart
function MiniTrendChart({ data, metricId }: { data: { date: Date; value: number }[]; metricId: string }) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${metricId}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#gradient-${metricId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// Main Panel Component
interface HealthMetricsPanelProps {
  compact?: boolean;
}

export function HealthMetricsPanel({ compact = false }: HealthMetricsPanelProps) {
  const {
    metrics,
    trends,
    healthChecks,
    pendingApprovals,
    activeStrikes,
    refreshMetrics,
    getOverallScore,
    getOverallStatus,
  } = useHealthMetricsStore();

  const overallScore = getOverallScore();
  const overallStatus = getOverallStatus();

  useEffect(() => {
    refreshMetrics();
  }, []);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Métricas de Saúde
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${overallStatus.color}20`, color: overallStatus.color }}
          >
            {overallStatus.icon}
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: overallStatus.color }}>
              {overallScore}
            </div>
            <div className="text-xs text-text-muted">{overallStatus.label}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Métricas de Saúde
          </h3>
          <p className="text-xs text-text-muted mt-1">
            P2 - Monitoramento de saúde do sistema de governança
          </p>
        </div>
        <button
          onClick={refreshMetrics}
          className="flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-border-default rounded-lg text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <RefreshCw size={12} />
          Atualizar
        </button>
      </div>

      {/* Overall Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-bg-card border border-border-default rounded-xl md:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wide">Score Geral</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold" style={{ color: overallStatus.color }}>
                  {overallScore}
                </span>
                <span className="text-lg text-text-muted">/100</span>
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: `${overallStatus.color}20`, color: overallStatus.color }}
            >
              {overallStatus.icon}
            </div>
          </div>

          {/* Circular Progress */}
          <div className="relative h-3 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all"
              style={{
                width: `${overallScore}%`,
                background: `linear-gradient(90deg, ${overallStatus.color}80, ${overallStatus.color})`,
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-dim">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="p-4 bg-bg-card border border-border-default rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock size={18} className="text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{pendingApprovals}</div>
                <div className="text-xs text-text-muted">Pendentes</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-bg-card border border-border-default rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Shield size={18} className="text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{activeStrikes}</div>
                <div className="text-xs text-text-muted">Strikes Ativos</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Health Checks */}
      {healthChecks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Activity size={14} className="text-[#6366f1]" />
            Verificações de Saúde
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {healthChecks.map((check) => (
              <HealthCheckItem key={check.id} check={check} />
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-[#6366f1]" />
          Métricas Detalhadas
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Trend Summary */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-[#6366f1]" />
          Tendência dos Últimos 7 Dias
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.slice(0, 4).map((metric) => {
            const last7 = trends.slice(-7).map((t) => ({
              date: t.date,
              value: t.metrics[metric.id as keyof typeof t.metrics] || 0,
            }));
            return (
              <div key={metric.id} className="p-3 bg-bg-card border border-border-default rounded-xl">
                <div className="text-xs text-text-muted mb-2">{metric.name}</div>
                <MiniTrendChart data={last7} metricId={metric.id} />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-dim">
                    {last7[0]?.value.toFixed(0)}
                  </span>
                  <span className="text-xs font-medium text-text-primary">
                    {last7[last7.length - 1]?.value.toFixed(0)} {metric.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
