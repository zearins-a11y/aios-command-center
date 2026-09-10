import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useEvaluationStore } from '../../stores/useEvaluationStore';
import {
  AgentEvaluation,
  AgentSource,
  AgentCategory,
  AgentStatus,
  Recommendation,
  SOURCE_INFO,
  RECOMMENDATION_INFO,
  calculateOverallScore,
  getPriorityFromScore,
} from '../../types/agentEvaluation';

const CATEGORY_LABELS: Record<AgentCategory, string> = {
  sales: 'Vendas',
  marketing: 'Marketing',
  design: 'Design',
  engineering: 'Engenharia',
  data: 'Dados',
  support: 'Suporte',
  operations: 'Operações',
  finance: 'Financeiro',
  legal: 'Jurídico',
  strategy: 'Estratégia',
  creative: 'Criativo',
  other: 'Outro',
};

const STATUS_LABELS: Record<AgentStatus, { label: string; color: string }> = {
  needed: { label: 'Necessário', color: '#ef4444' },
  have_it: { label: 'Já temos', color: '#22c55e' },
  duplicate: { label: 'Duplicado', color: '#f59e0b' },
  redundant: { label: 'Redundante', color: '#94a3b8' },
  tbd: { label: 'A avaliar', color: '#6366f1' },
};

interface EvaluationCardProps {
  evaluation: AgentEvaluation;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function EvaluationCard({ evaluation, onEdit, onDelete }: EvaluationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const overallScore = calculateOverallScore(evaluation);
  const priority = getPriorityFromScore(overallScore);
  const sourceInfo = SOURCE_INFO[evaluation.source];
  const recInfo = RECOMMENDATION_INFO[evaluation.recommendation];
  const statusInfo = STATUS_LABELS[evaluation.status];

  const priorityColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#94a3b8',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-bg-card border border-border-default rounded-xl overflow-hidden hover:border-border-default/80 transition-colors"
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Source Badge */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{
                backgroundColor: `${sourceInfo.color}20`,
                color: sourceInfo.color,
              }}
              title={sourceInfo.label}
            >
              {sourceInfo.icon}
            </div>

            {/* Title + Status */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-text-primary truncate">
                  {evaluation.name}
                </h3>
                {evaluation.sourcePath && (
                  <a
                    href={evaluation.sourcePath.startsWith('http') ? evaluation.sourcePath : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-dim hover:text-text-primary flex-shrink-0"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Source */}
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${sourceInfo.color}20`, color: sourceInfo.color }}
                >
                  {sourceInfo.label}
                </span>

                {/* Category */}
                <span className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded">
                  {CATEGORY_LABELS[evaluation.category]}
                </span>

                {/* Status */}
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-text-muted" />
              <span
                className="text-2xl font-bold"
                style={{ color: priorityColors[priority] }}
              >
                {overallScore}
              </span>
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: priorityColors[priority] }}
            >
              {priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed mb-3">
          {evaluation.description}
        </p>

        {/* Recommendation */}
        <div className="flex items-center justify-between gap-3 mb-3 p-3 bg-bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{recInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold"
                style={{ color: recInfo.color }}
              >
                {recInfo.label}
              </div>
              <div className="text-xs text-text-muted line-clamp-2">
                {evaluation.reasoning}
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
          >
            {expanded ? (
              <ChevronUp size={16} className="text-text-muted" />
            ) : (
              <ChevronDown size={16} className="text-text-muted" />
            )}
          </button>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {[
            { key: 'fitWithAios', label: 'AIOS', value: evaluation.fitWithAios },
            { key: 'fitWithXquads', label: 'XQuads', value: evaluation.fitWithXquads },
            { key: 'reusability', label: 'Reuso', value: evaluation.reusability },
            { key: 'businessValue', label: 'Valor', value: evaluation.businessValue },
            { key: 'maintenanceCost', label: 'Manut.', value: evaluation.maintenanceCost },
          ].map((metric) => (
            <div key={metric.key} className="text-center">
              <div className="text-xs text-text-dim mb-1">{metric.label}</div>
              <div className="h-1 bg-bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: metric.value >= 70 ? '#22c55e' : metric.value >= 40 ? '#eab308' : '#ef4444',
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-text-muted mt-1">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-default bg-bg-secondary/30 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Capabilities */}
              <div>
                <div className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2">
                  Capacidades
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {evaluation.capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-bg-card border border-border-default rounded text-text-muted"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Integration Steps */}
              {evaluation.integrationSteps && evaluation.integrationSteps.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <TrendingUp size={12} />
                    Passos de Integração
                  </div>
                  <ol className="space-y-1.5">
                    {evaluation.integrationSteps.map((step, idx) => (
                      <li key={idx} className="text-sm text-text-muted flex items-start gap-2">
                        <span className="text-text-dim flex-shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {evaluation.estimatedHours && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-text-dim">
                      <Clock size={12} />
                      <span>Estimativa: {evaluation.estimatedHours}h</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {(onEdit || onDelete) && (
                <div className="flex items-center gap-2 pt-2 border-t border-border-default">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(evaluation.id)}
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-2 py-1 rounded hover:bg-bg-secondary transition-colors"
                    >
                      <Edit3 size={12} />
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(evaluation.id)}
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} />
                      Remover
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function EvaluationPanel() {
  const {
    evaluations,
    filters,
    setFilters,
    clearFilters,
    getFilteredEvaluations,
    getSummary,
    removeEvaluation,
  } = useEvaluationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvaluations = useMemo(() => {
    return getFilteredEvaluations();
  }, [evaluations, filters, searchQuery, getFilteredEvaluations]);

  const summary = useMemo(() => getSummary(), [evaluations, getSummary]);

  // Sort by score descending
  const sortedEvaluations = useMemo(() => {
    return [...filteredEvaluations].sort((a, b) => {
      return calculateOverallScore(b) - calculateOverallScore(a);
    });
  }, [filteredEvaluations]);

  const handleSourceToggle = (source: AgentSource) => {
    const current = filters.sources || [];
    const updated = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    setFilters({ ...filters, sources: updated });
  };

  const handleCategoryToggle = (category: AgentCategory) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    setFilters({ ...filters, categories: updated });
  };

  const handleStatusToggle = (status: AgentStatus) => {
    const current = filters.statuses || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    setFilters({ ...filters, statuses: updated });
  };

  const handleRecommendationToggle = (rec: Recommendation) => {
    const current = filters.recommendations || [];
    const updated = current.includes(rec)
      ? current.filter((r) => r !== rec)
      : [...current, rec];
    setFilters({ ...filters, recommendations: updated });
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-bg-card border border-border-default rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-dim uppercase tracking-wide">Total Agentes</span>
            <Star size={14} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{summary.totalAgents}</div>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-dim uppercase tracking-wide">Gaps Críticos</span>
            <AlertCircle size={14} className="text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{summary.criticalGaps}</div>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-dim uppercase tracking-wide">Score Médio</span>
            <TrendingUp size={14} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{summary.averageScore}</div>
        </div>

        <div className="bg-bg-card border border-border-default rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-dim uppercase tracking-wide">Horas Estimadas</span>
            <Clock size={14} className="text-text-muted" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{summary.totalEstimatedHours}h</div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-bg-card border border-border-default rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou capacidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters || Object.keys(filters).length > 0
                ? 'bg-[#6366f1]/10 border-[#6366f1]/30 text-[#6366f1]'
                : 'bg-bg-secondary border-border-default text-text-muted hover:text-text-primary'
            }`}
          >
            <Filter size={16} />
            <span className="text-sm font-medium">Filtros</span>
          </button>

          {(Object.keys(filters).length > 0 || searchQuery) && (
            <button
              onClick={() => {
                clearFilters();
                setSearchQuery('');
              }}
              className="text-xs text-text-muted hover:text-text-primary px-3 py-2 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filter Panels */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 mt-4 border-t border-border-default">
                {/* Sources */}
                <div>
                  <div className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2">
                    Fontes
                  </div>
                  <div className="space-y-1">
                    {Object.entries(SOURCE_INFO).map(([source, info]) => (
                      <button
                        key={source}
                        onClick={() => handleSourceToggle(source as AgentSource)}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors ${
                          filters.sources?.includes(source as AgentSource)
                            ? 'bg-bg-secondary text-text-primary'
                            : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/50'
                        }`}
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2">
                    Status
                  </div>
                  <div className="space-y-1">
                    {Object.entries(STATUS_LABELS).map(([status, info]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusToggle(status as AgentStatus)}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors ${
                          filters.statuses?.includes(status as AgentStatus)
                            ? 'bg-bg-secondary text-text-primary'
                            : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/50'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                        <span>{info.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <div className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2">
                    Recomendação
                  </div>
                  <div className="space-y-1">
                    {Object.entries(RECOMMENDATION_INFO).map(([rec, info]) => (
                      <button
                        key={rec}
                        onClick={() => handleRecommendationToggle(rec as Recommendation)}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors ${
                          filters.recommendations?.includes(rec as Recommendation)
                            ? 'bg-bg-secondary text-text-primary'
                            : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/50'
                        }`}
                      >
                        <span>{info.icon}</span>
                        <span>{info.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <div className="text-xs font-medium text-text-dim uppercase tracking-wide mb-2">
                    Categorias
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryToggle(cat as AgentCategory)}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors ${
                          filters.categories?.includes(cat as AgentCategory)
                            ? 'bg-bg-secondary text-text-primary'
                            : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary/50'
                        }`}
                      >
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-muted">
          Mostrando <span className="font-semibold text-text-primary">{sortedEvaluations.length}</span> de{' '}
          <span className="font-semibold text-text-primary">{evaluations.length}</span> agentes
        </div>
      </div>

      {/* Cards Grid */}
      {sortedEvaluations.length === 0 ? (
        <div className="bg-bg-card border border-border-default rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center">
              <CheckCircle2 size={32} className="text-text-muted" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary mb-1">
                Nenhum agente encontrado
              </h3>
              <p className="text-sm text-text-muted">
                Ajuste os filtros ou aguarde novas avaliações
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedEvaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                onDelete={(id) => removeEvaluation(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
