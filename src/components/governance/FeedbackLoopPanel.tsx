import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { useFeedbackLoopStore, FEEDBACK_PATTERN_LABELS, FEEDBACK_PATTERN_ICONS, FEEDBACK_DECISION_LABELS } from '../../stores/useFeedbackLoopStore';
import {
  FeedbackSignal,
  AgentFeedbackSummary,
  FeedbackPatternStats,
  getAvailablePatterns,
} from '../../utils/feedbackLoop';

// Feedback Card Component
interface FeedbackCardProps {
  feedback: FeedbackSignal;
  onAcknowledge?: (id: string) => void;
}

function FeedbackCard({ feedback, onAcknowledge }: FeedbackCardProps) {
  const [expanded, setExpanded] = useState(false);

  const decisionConfig = {
    approved: { icon: <CheckCircle2 size={14} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    rejected: { icon: <XCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    modified: { icon: <Edit3 size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  };

  const config = decisionConfig[feedback.decision];
  const patternLabel = FEEDBACK_PATTERN_LABELS[feedback.pattern];
  const patternIcon = FEEDBACK_PATTERN_ICONS[feedback.pattern];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl border overflow-hidden ${config.bg} ${config.border}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Decision Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
                {config.icon}
                {FEEDBACK_DECISION_LABELS[feedback.decision]}
              </span>
              <span className="text-xs text-text-muted px-2 py-0.5 bg-bg-secondary rounded">
                {patternIcon} {patternLabel}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">
              {feedback.itemTitle}
            </h3>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <User size={12} />
                {feedback.agentName}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(feedback.reviewedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Pattern */}
          <div className="text-right">
            <div className="text-2xl">{patternIcon}</div>
            <div className="text-xs text-text-muted">{feedback.patternConfidence}%</div>
          </div>
        </div>

        {/* Reason */}
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">
          {feedback.reason}
        </p>

        {/* Acknowledgment */}
        {feedback.agentAcknowledged && (
          <div className="mt-3 flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 size={12} />
            Agente reconhece feedback
          </div>
        )}

        {feedback.improvementSuggestion && !feedback.agentAcknowledged && (
          <div className="mt-3 p-2 bg-bg-secondary/50 rounded-lg">
            <div className="text-xs text-text-muted mb-1">Sugestão de melhoria:</div>
            <div className="text-xs text-text-secondary">{feedback.improvementSuggestion}</div>
          </div>
        )}

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Recolher' : 'Ver detalhes'}
        </button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-default overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Reviewer */}
              <div className="flex items-center gap-2 text-xs">
                <User size={12} className="text-text-muted" />
                <span className="text-text-muted">Revisado por:</span>
                <span className="text-text-primary font-medium">{feedback.reviewerName}</span>
              </div>

              {/* Original vs Modified */}
              {feedback.originalContent && feedback.modifiedContent && (
                <div className="space-y-2">
                  <div className="text-xs text-text-muted font-medium">Alterações:</div>
                  <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                    <div className="text-xs text-red-400 mb-1">Antes:</div>
                    <div className="text-xs text-text-secondary">{feedback.originalContent}</div>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                    <div className="text-xs text-green-400 mb-1">Depois:</div>
                    <div className="text-xs text-text-secondary">{feedback.modifiedContent}</div>
                  </div>
                  {feedback.changeDescription && (
                    <div className="text-xs text-text-muted italic">
                      {feedback.changeDescription}
                    </div>
                  )}
                </div>
              )}

              {/* Acknowledge Button */}
              {onAcknowledge && !feedback.agentAcknowledged && (
                <button
                  onClick={() => onAcknowledge(feedback.id)}
                  className="w-full text-xs px-3 py-2 bg-[#6366f1] rounded-lg text-white hover:bg-[#4f46e5] transition-colors"
                >
                  Marcar como Reconhecido
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Agent Performance Card
function AgentPerformanceCard({ summary }: { summary: AgentFeedbackSummary }) {
  const trendConfig = {
    improving: { icon: <TrendingUp size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
    stable: { icon: <Minus size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    worsening: { icon: <TrendingDown size={14} />, color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  const trend = trendConfig[summary.trend];

  return (
    <div className="p-4 bg-bg-card border border-border-default rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <User size={16} className="text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">{summary.agentName}</span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trend.bg} ${trend.color}`}>
          {trend.icon}
          {summary.trend === 'improving' ? 'Melhorando' : summary.trend === 'worsening' ? 'Piorando' : 'Estável'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-green-500/10 rounded-lg">
          <div className="text-lg font-bold text-green-400">{summary.approvalRate}%</div>
          <div className="text-xs text-text-muted">Aprovação</div>
        </div>
        <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
          <div className="text-lg font-bold text-yellow-400">{summary.modificationRate}%</div>
          <div className="text-xs text-text-muted">Modificado</div>
        </div>
        <div className="text-center p-2 bg-red-500/10 rounded-lg">
          <div className="text-lg font-bold text-red-400">{summary.rejectionRate}%</div>
          <div className="text-xs text-text-muted">Rejeitado</div>
        </div>
      </div>

      {/* Top Patterns */}
      {summary.topPatterns.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-text-muted mb-1">Padrões principais:</div>
          <div className="flex flex-wrap gap-1">
            {summary.topPatterns.map((pattern) => (
              <span key={pattern} className="text-xs px-2 py-0.5 bg-bg-secondary rounded">
                {FEEDBACK_PATTERN_ICONS[pattern]} {FEEDBACK_PATTERN_LABELS[pattern]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Score */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">Score de Melhoria</span>
        <span className={`font-semibold ${
          summary.improvementScore >= 80 ? 'text-green-400' :
          summary.improvementScore >= 60 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {summary.improvementScore}/100
        </span>
      </div>
      <div className="mt-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            summary.improvementScore >= 80 ? 'bg-green-500' :
            summary.improvementScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${summary.improvementScore}%` }}
        />
      </div>
    </div>
  );
}

// Pattern Stats Bar
function PatternStatsBar({ stats }: { stats: FeedbackPatternStats }) {
  const trendConfig = {
    improving: { icon: <TrendingUp size={12} />, color: 'text-green-400' },
    stable: { icon: <Minus size={12} />, color: 'text-yellow-400' },
    worsening: { icon: <TrendingDown size={12} />, color: 'text-red-400' },
  };

  const trend = trendConfig[stats.trend];

  return (
    <div className="flex items-center gap-3 p-2 bg-bg-secondary/50 rounded-lg">
      <span className="text-lg">{FEEDBACK_PATTERN_ICONS[stats.pattern]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-text-primary truncate">
            {FEEDBACK_PATTERN_LABELS[stats.pattern]}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            {trend.icon}
            {stats.count}
          </span>
        </div>
        <div className="h-1.5 bg-bg-primary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              stats.trend === 'worsening' ? 'bg-red-500' :
              stats.trend === 'improving' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.max(stats.percentage, 5)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Main Panel
interface FeedbackLoopPanelProps {
  compact?: boolean;
}

export function FeedbackLoopPanel({ compact = false }: FeedbackLoopPanelProps) {
  const {
    patternFilter,
    setPatternFilter,
    decisionFilter,
    setDecisionFilter,
    acknowledgeFeedback,
    getAllAgentSummaries,
    getPatternStatistics,
    getRecentFeedback,
    getFilteredFeedback,
    getOverallStats,
  } = useFeedbackLoopStore();

  const agentSummaries = getAllAgentSummaries();
  const patternStats = getPatternStatistics(30);
  const recentFeedback = getRecentFeedback(compact ? 3 : 10);
  const filteredFeedback = getFilteredFeedback();
  const overallStats = getOverallStats();
  const availablePatterns = getAvailablePatterns();

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Feedback Loop
          </h3>
          <span className="text-xs text-text-dim">
            {overallStats.totalFeedback} feedback
          </span>
        </div>

        {recentFeedback.length === 0 ? (
          <div className="text-center py-6 text-text-muted">
            <RefreshCw size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhum feedback ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentFeedback.slice(0, 3).map((fb) => (
              <FeedbackCard key={fb.id} feedback={fb} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Feedback Loop
          </h3>
          <p className="text-xs text-text-muted mt-1">
            P1 - Decisões humanas alimentam melhoria dos agentes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {overallStats.totalFeedback} feedback
          </span>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-xs text-text-muted">Taxa de Aprovação</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{overallStats.approvalRate}%</div>
        </div>
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 size={14} className="text-yellow-400" />
            <span className="text-xs text-text-muted">Taxa de Modificação</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{overallStats.modificationRate}%</div>
        </div>
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={14} className="text-red-400" />
            <span className="text-xs text-text-muted">Taxa de Rejeição</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{overallStats.rejectionRate}%</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-text-muted" />
            <span className="text-xs text-text-muted">Tempo Médio</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{overallStats.avgResponseTime}h</div>
        </div>
      </div>

      {/* Agent Performance */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-[#6366f1]" />
          <h4 className="text-sm font-semibold text-text-primary">Performance por Agente</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {agentSummaries.map((summary) => (
            <AgentPerformanceCard key={summary.agentId} summary={summary} />
          ))}
        </div>
      </div>

      {/* Pattern Statistics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-[#a855f7]" />
          <h4 className="text-sm font-semibold text-text-primary">Padrões de Erro (30 dias)</h4>
        </div>
        <div className="space-y-2">
          {patternStats.filter((s) => s.count > 0).slice(0, 6).map((stats) => (
            <PatternStatsBar key={stats.pattern} stats={stats} />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-text-muted block mb-1">Decisão</label>
          <div className="flex gap-1">
            {(['all', 'approved', 'modified', 'rejected'] as const).map((decision) => (
              <button
                key={decision}
                onClick={() => setDecisionFilter(decision)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  decisionFilter === decision
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                {decision === 'all' ? 'Todos' : FEEDBACK_DECISION_LABELS[decision]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Padrão</label>
          <select
            value={patternFilter}
            onChange={(e) => setPatternFilter(e.target.value as any)}
            className="px-2 py-1 bg-bg-secondary border border-border-default rounded text-xs text-text-primary focus:outline-none focus:border-[#6366f1]"
          >
            <option value="all">Todos</option>
            {availablePatterns.map((p) => (
              <option key={p.value} value={p.value}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recent Feedback */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-text-muted" />
          <h4 className="text-sm font-semibold text-text-primary">Feedback Recente</h4>
        </div>
        <div className="space-y-3">
          <AnimatePresence>
            {filteredFeedback.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-text-muted"
              >
                <RefreshCw size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhum feedback encontrado</p>
              </motion.div>
            ) : (
              filteredFeedback.slice(0, 10).map((fb) => (
                <FeedbackCard
                  key={fb.id}
                  feedback={fb}
                  onAcknowledge={acknowledgeFeedback}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
