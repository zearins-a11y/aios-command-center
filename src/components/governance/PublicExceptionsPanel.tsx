import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  FileText,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Shield,
} from 'lucide-react';
import { usePublicExceptionsStore, EXCEPTION_TYPE_LABELS, EXCEPTION_STATUS_LABELS, SEVERITY_LABELS } from '../../stores/usePublicExceptionsStore';
import {
  PublicException,
  EXCEPTION_TYPE_ICONS,
  SEVERITY_COLORS,
  calculateExceptionRisk,
  isExceptionActive,
  getExceptionAge,
  getTimeUntilExpiration,
} from '../../utils/publicExceptions';

// Exception Card Component
function ExceptionCard({ exception }: { exception: PublicException }) {
  const [expanded, setExpanded] = useState(false);
  const severityColors = SEVERITY_COLORS[exception.severity];
  const riskScore = calculateExceptionRisk(exception);
  const age = getExceptionAge(exception);
  const expiresIn = getTimeUntilExpiration(exception);
  const isActive = isExceptionActive(exception);

  const statusConfig = {
    pending: { icon: <Clock size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    approved: { icon: <CheckCircle2 size={14} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    rejected: { icon: <XCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    expired: { icon: <Clock size={14} />, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
    revoked: { icon: <XCircle size={14} />, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  };

  const status = statusConfig[exception.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl border overflow-hidden ${status.bg} ${status.border}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Type & Severity */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{EXCEPTION_TYPE_ICONS[exception.type]}</span>
              <span className="text-sm font-medium text-text-primary">
                {EXCEPTION_TYPE_LABELS[exception.type]}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors.bg} ${severityColors.text}`}>
                {SEVERITY_LABELS[exception.severity]}
              </span>
              {isActive && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  Ativa
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              {exception.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-text-muted line-clamp-2 mb-2">
              {exception.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <User size={12} />
                {exception.requestedBy}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                há {age} dia{age !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Status & Risk */}
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
              {status.icon}
              {EXCEPTION_STATUS_LABELS[exception.status]}
            </div>
            <div className="mt-2 text-xs text-text-muted">
              Risco: <span className={`font-medium ${
                riskScore >= 60 ? 'text-red-400' : riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'
              }`}>{riskScore}</span>
            </div>
          </div>
        </div>

        {/* Expires Soon Warning */}
        {expiresIn !== null && expiresIn <= 7 && expiresIn > 0 && (
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-yellow-400">
              <Clock size={12} />
              Expira em {expiresIn} dia{expiresIn !== 1 ? 's' : ''}
            </div>
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

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border-default overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Justification */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Justificativa
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {exception.justification}
                </p>
              </div>

              {/* Business Impact */}
              {exception.businessImpact && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Impacto de Negócio
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {exception.businessImpact}
                  </p>
                </div>
              )}

              {/* Conditions */}
              {exception.conditions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Condições ({exception.conditions.length})
                  </h4>
                  <ul className="space-y-1">
                    {exception.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-[#6366f1]">•</span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Approval Notes */}
              {exception.approvalNotes && (
                <div className="p-3 bg-bg-secondary/50 rounded-lg">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Nota de Aprovação
                  </h4>
                  <p className="text-sm text-text-secondary">{exception.approvalNotes}</p>
                </div>
              )}

              {/* Resolution */}
              {exception.resolvedAt && (
                <div className="p-3 bg-bg-secondary/50 rounded-lg">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Resolução
                  </h4>
                  <p className="text-sm text-text-secondary">{exception.resolutionNotes}</p>
                  {exception.lessonsLearned && (
                    <p className="text-xs text-[#6366f1] mt-2">
                      <span className="font-medium">Lição aprendida: </span>
                      {exception.lessonsLearned}
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              {exception.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exception.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-bg-secondary rounded text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Panel Component
interface PublicExceptionsPanelProps {
  compact?: boolean;
}

export function PublicExceptionsPanel({ compact = false }: PublicExceptionsPanelProps) {
  const {
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    getFilteredExceptions,
    getPendingExceptions,
    getExpiringSoon,
    getOverallStats,
  } = usePublicExceptionsStore();

  const filteredExceptions = getFilteredExceptions();
  const pendingExceptions = getPendingExceptions();
  const expiringSoon = getExpiringSoon(7);
  const stats = getOverallStats();

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Exceções Públicas
          </h3>
          {pendingExceptions.length > 0 && (
            <span className="text-xs text-yellow-400">
              {pendingExceptions.length} pendente{pendingExceptions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {pendingExceptions.length === 0 ? (
          <div className="text-center py-6 text-text-muted">
            <Shield size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhuma exceção pendente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingExceptions.slice(0, 3).map((exc) => (
              <ExceptionCard key={exc.id} exception={exc} />
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
            Exceções Públicas
          </h3>
          <p className="text-xs text-text-muted mt-1">
            P2 - Log de transparência para decisões do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {pendingExceptions.length} pendente{pendingExceptions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-[#6366f1]" />
            <span className="text-xs text-text-muted">Total</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-yellow-400" />
            <span className="text-xs text-text-muted">Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-xs text-text-muted">Ativas</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.active}</div>
        </div>
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <span className="text-xs text-text-muted">Alto Risco</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.highRiskCount}</div>
        </div>
      </div>

      {/* Expiring Soon Warning */}
      {expiringSoon.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-400">
              Exceções Expirando em Breve
            </span>
          </div>
          <div className="space-y-2">
            {expiringSoon.map((exc) => (
              <div key={exc.id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">{exc.title}</span>
                <span className="text-yellow-400">
                  {getTimeUntilExpiration(exc)} dia{getTimeUntilExpiration(exc) !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-xs text-text-muted block mb-1">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2 py-1 bg-bg-secondary border border-border-default rounded text-xs text-text-primary focus:outline-none focus:border-[#6366f1]"
          >
            <option value="all">Todos</option>
            {Object.entries(EXCEPTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {EXCEPTION_TYPE_ICONS[value as keyof typeof EXCEPTION_TYPE_ICONS]} {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Status</label>
          <div className="flex gap-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                {status === 'all' ? 'Todos' : EXCEPTION_STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Severidade</label>
          <div className="flex gap-1">
            {(['all', 'low', 'medium', 'high', 'critical'] as const).map((severity) => (
              <button
                key={severity}
                onClick={() => setSeverityFilter(severity)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  severityFilter === severity
                    ? 'bg-[#6366f1] text-white'
                    : 'bg-bg-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                {severity === 'all' ? 'Todos' : SEVERITY_LABELS[severity]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exceptions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredExceptions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-text-muted"
            >
              <Shield size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma exceção encontrada</p>
            </motion.div>
          ) : (
            filteredExceptions.map((exc) => (
              <ExceptionCard key={exc.id} exception={exc} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
