import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  User,
  Plus,
} from 'lucide-react';
import { useAppealsStore, APPEAL_STATUS_LABELS, APPEAL_DECISION_LABELS } from '../../stores/useAppealsStore';
import {
  Appeal,
  AppealGrounds,
  AppealDecision,
  APPEAL_GROUNDS_LABELS,
  getAvailableGrounds,
  getTimeRemaining,
  getSlaStatus,
} from '../../utils/appealsProcess';
import { useAppealsStore as useAppealsConfig } from '../../stores/useAppealsStore';

// Appeal Card Component
interface AppealCardProps {
  appeal: Appeal;
  onWithdraw?: (id: string) => void;
  onDecide?: (id: string, decision: AppealDecision, notes: string) => void;
  onStartReview?: (id: string) => void;
  showActions?: boolean;
}

function AppealCard({ appeal, onWithdraw, onDecide, onStartReview, showActions = true }: AppealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const { config } = useAppealsConfig();

  const slaInfo = getSlaStatus(appeal, config);
  const timeRemaining = getTimeRemaining(appeal.expiresAt);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending_submission: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
    submitted: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    under_review: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    approved: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    withdrawn: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
    expired: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const colors = statusColors[appeal.status] || statusColors.pending_submission;

  const statusIcons: Record<string, React.ReactNode> = {
    pending_submission: <Clock size={14} />,
    submitted: <Send size={14} />,
    under_review: <User size={14} />,
    approved: <CheckCircle2 size={14} />,
    rejected: <XCircle size={14} />,
    withdrawn: <XCircle size={14} />,
    expired: <AlertTriangle size={14} />,
  };

  const isPending = ['submitted', 'under_review'].includes(appeal.status);
  const canWithdraw = isPending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl border overflow-hidden ${colors.bg} ${colors.border}`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                {statusIcons[appeal.status]}
                {APPEAL_STATUS_LABELS[appeal.status]}
              </span>
              {appeal.priority === 'urgent' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                  <AlertTriangle size={10} />
                  Urgente
                </span>
              )}
              {appeal.priority === 'elevated' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Prioridade Alta
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">
              {appeal.approvalItemTitle}
            </h3>

            {/* Grounds */}
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="px-2 py-0.5 bg-bg-secondary rounded">
                {APPEAL_GROUNDS_LABELS[appeal.grounds]}
              </span>
              <span>por {appeal.submittedBy}</span>
            </div>
          </div>

          {/* SLA */}
          {isPending && (
            <div className={`text-right px-3 py-1 rounded-lg ${
              slaInfo === 'critical' || slaInfo === 'breached'
                ? 'bg-red-500/20'
                : slaInfo === 'warning'
                ? 'bg-yellow-500/20'
                : 'bg-bg-secondary'
            }`}>
              <div className={`text-xs font-medium ${
                slaInfo === 'critical' || slaInfo === 'breached'
                  ? 'text-red-400'
                  : slaInfo === 'warning'
                  ? 'text-yellow-400'
                  : 'text-text-muted'
              }`}>
                {timeRemaining}
              </div>
            </div>
          )}

          {/* Decision */}
          {appeal.decision && (
            <div className={`text-right px-3 py-1 rounded-lg ${
              appeal.decision === 'overturned'
                ? 'bg-green-500/20'
                : appeal.decision === 'upheld'
                ? 'bg-red-500/20'
                : 'bg-blue-500/20'
            }`}>
              <div className={`text-xs font-medium ${
                appeal.decision === 'overturned'
                  ? 'text-green-400'
                  : appeal.decision === 'upheld'
                  ? 'text-red-400'
                  : 'text-blue-400'
              }`}>
                {APPEAL_DECISION_LABELS[appeal.decision]}
              </div>
            </div>
          )}
        </div>

        {/* Expand/Collapse */}
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
            <div className="p-4 space-y-4">
              {/* Justification */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                  Justificativa
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {appeal.justification}
                </p>
              </div>

              {/* Evidence */}
              {appeal.evidence.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Evidências ({appeal.evidence.length})
                  </h4>
                  <div className="space-y-2">
                    {appeal.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-bg-secondary rounded-lg"
                      >
                        <FileText size={14} className="text-text-muted mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-text-primary truncate">
                            {ev.description || ev.content}
                          </div>
                          <div className="text-xs text-text-dim truncate">
                            {ev.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer */}
              {appeal.assignedReviewerName && (
                <div className="flex items-center gap-2 p-2 bg-bg-secondary rounded-lg">
                  <User size={14} className="text-text-muted" />
                  <div>
                    <span className="text-xs text-text-muted">Revisor: </span>
                    <span className="text-xs font-medium text-text-primary">
                      {appeal.assignedReviewerName}
                    </span>
                  </div>
                </div>
              )}

              {/* Reviewer Notes */}
              {appeal.reviewerNotes && (
                <div className="p-3 bg-bg-secondary rounded-lg border-l-2 border-[#6366f1]">
                  <h4 className="text-xs font-semibold text-text-muted mb-1">
                    Parecer do Revisor
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {appeal.reviewerNotes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                  Timeline
                </h4>
                <div className="space-y-2">
                  {appeal.timeline.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] mt-1.5" />
                      <div className="flex-1">
                        <div className="text-text-primary">
                          <span className="font-medium">{entry.actor}</span>
                          <span className="text-text-muted"> - {entry.details || entry.action}</span>
                        </div>
                        <div className="text-text-dim">
                          {new Date(entry.timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex gap-2 pt-2 border-t border-border-default">
                  {canWithdraw && onWithdraw && (
                    <button
                      onClick={() => onWithdraw(appeal.id)}
                      className="flex-1 text-xs px-3 py-2 bg-bg-secondary rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
                    >
                      Retirar Recurso
                    </button>
                  )}
                  {appeal.status === 'submitted' && onStartReview && (
                    <button
                      onClick={() => onStartReview(appeal.id)}
                      className="flex-1 text-xs px-3 py-2 bg-[#6366f1] rounded-lg text-white hover:bg-[#4f46e5] transition-colors"
                    >
                      Iniciar Revisão
                    </button>
                  )}
                  {appeal.status === 'under_review' && onDecide && (
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Adicione seu parecer..."
                        className="w-full text-xs p-2 bg-bg-secondary rounded-lg border border-border-default resize-none focus:outline-none focus:border-[#6366f1]"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onDecide(appeal.id, 'overturned', notes);
                            setNotes('');
                          }}
                          className="flex-1 text-xs px-3 py-2 bg-green-500 rounded-lg text-white hover:bg-green-600 transition-colors"
                        >
                          Reformar
                        </button>
                        <button
                          onClick={() => {
                            onDecide(appeal.id, 'upheld', notes);
                            setNotes('');
                          }}
                          className="flex-1 text-xs px-3 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                        >
                          Manter
                        </button>
                      </div>
                    </div>
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

// Appeals Panel Component
interface AppealsPanelProps {
  compact?: boolean;
}

export function AppealsPanel({ compact = false }: AppealsPanelProps) {
  const {
    appeals,
    statusFilter,
    setStatusFilter,
    withdrawAppeal,
    startReview,
    decideAppeal,
    getPendingAppeals,
    getUrgentAppeals,
  } = useAppealsStore();

  const pendingAppeals = getPendingAppeals();
  const urgentAppeals = getUrgentAppeals();
  const filteredAppeals = statusFilter === 'all'
    ? appeals
    : appeals.filter((a) => a.status === statusFilter);

  const statusCounts = {
    all: appeals.length,
    pending_submission: appeals.filter((a) => a.status === 'pending_submission').length,
    submitted: appeals.filter((a) => a.status === 'submitted').length,
    under_review: appeals.filter((a) => a.status === 'under_review').length,
    approved: appeals.filter((a) => a.status === 'approved').length,
    rejected: appeals.filter((a) => a.status === 'rejected').length,
    withdrawn: appeals.filter((a) => a.status === 'withdrawn').length,
    expired: appeals.filter((a) => a.status === 'expired').length,
  };

  const handleWithdraw = (id: string) => {
    withdrawAppeal(id, 'Operador');
  };

  const handleStartReview = (id: string) => {
    startReview(id, 'brand_guardian');
  };

  const handleDecide = (id: string, decision: AppealDecision, notes: string) => {
    decideAppeal(id, decision, notes);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Recursos
          </h3>
          {pendingAppeals.length > 0 && (
            <span className="text-xs text-text-dim">
              {pendingAppeals.length} pendente{pendingAppeals.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {pendingAppeals.length === 0 ? (
          <div className="text-center py-6 text-text-muted">
            <Scale size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhum recurso pendente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingAppeals.slice(0, 3).map((appeal) => (
              <AppealCard
                key={appeal.id}
                appeal={appeal}
                onWithdraw={handleWithdraw}
                onStartReview={handleStartReview}
                onDecide={handleDecide}
                showActions={false}
              />
            ))}
            {pendingAppeals.length > 3 && (
              <button className="w-full text-xs text-[#6366f1] hover:underline py-2">
                Ver todos ({pendingAppeals.length})
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Processo de Recursos
          </h3>
          <p className="text-xs text-text-muted mt-1">
            P1 - Contestação de decisões de bloqueio/rejeição
          </p>
        </div>
        <div className="flex items-center gap-3">
          {urgentAppeals.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-lg">
              <AlertTriangle size={12} />
              {urgentAppeals.length} urgente{urgentAppeals.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs text-text-muted">
            {pendingAppeals.length} pendente{pendingAppeals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'submitted', 'under_review', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? 'bg-[#6366f1] text-white'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary'
            }`}
          >
            {status === 'all' ? 'Todos' : APPEAL_STATUS_LABELS[status]}
            <span className="ml-1.5 opacity-60">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Appeals List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAppeals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-text-muted"
            >
              <Scale size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum recurso encontrado</p>
            </motion.div>
          ) : (
            filteredAppeals.map((appeal) => (
              <AppealCard
                key={appeal.id}
                appeal={appeal}
                onWithdraw={handleWithdraw}
                onStartReview={handleStartReview}
                onDecide={handleDecide}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Appeal Submission Modal (for creating new appeals)
interface AppealSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvalItemId: string;
  approvalItemTitle: string;
  onSubmit: (grounds: AppealGrounds, justification: string, evidence: Array<{ type: string; content: string; description?: string }>) => void;
}

export function AppealSubmissionModal({
  isOpen,
  onClose,
  approvalItemTitle,
  onSubmit,
}: AppealSubmissionModalProps) {
  const [grounds, setGrounds] = useState<AppealGrounds | ''>('');
  const [justification, setJustification] = useState('');
  const [evidence, setEvidence] = useState<Array<{ type: string; content: string; description?: string }>>([]);

  const availableGrounds = getAvailableGrounds();

  const handleSubmit = () => {
    if (!grounds || !justification) return;
    onSubmit(grounds as AppealGrounds, justification, evidence);
    setGrounds('');
    setJustification('');
    setEvidence([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-card border border-border-default rounded-xl w-full max-w-lg mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/20 flex items-center justify-center">
                <Scale size={18} className="text-[#6366f1]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  Submeter Recurso
                </h3>
                <p className="text-xs text-text-muted truncate max-w-[280px]">
                  {approvalItemTitle}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-bg-secondary rounded">
              <XCircle size={18} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Grounds Selection */}
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-2">
              Motivo do Recurso
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableGrounds.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGrounds(g.value)}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    grounds === g.value
                      ? 'border-[#6366f1] bg-[#6366f1]/10'
                      : 'border-border-default hover:border-[#6366f1]/50'
                  }`}
                >
                  <div className="text-xs font-medium text-text-primary">
                    {g.label}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {g.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Justification */}
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide block mb-2">
              Justificativa *
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explique por que você acredita que a decisão deve ser revista..."
              className="w-full h-32 p-3 bg-bg-secondary rounded-lg border border-border-default resize-none focus:outline-none focus:border-[#6366f1] text-sm text-text-primary placeholder:text-text-dim"
            />
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Evidências (opcional)
              </label>
              <button
                onClick={() => setEvidence([...evidence, { type: 'link', content: '', description: '' }])}
                className="flex items-center gap-1 text-xs text-[#6366f1] hover:underline"
              >
                <Plus size={12} />
                Adicionar
              </button>
            </div>
            {evidence.map((ev, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ev.description}
                  onChange={(e) => {
                    const newEvidence = [...evidence];
                    newEvidence[idx].description = e.target.value;
                    setEvidence(newEvidence);
                  }}
                  placeholder="Descrição"
                  className="flex-1 px-2 py-1.5 bg-bg-secondary rounded border border-border-default text-xs focus:outline-none focus:border-[#6366f1]"
                />
                <input
                  type="text"
                  value={ev.content}
                  onChange={(e) => {
                    const newEvidence = [...evidence];
                    newEvidence[idx].content = e.target.value;
                    setEvidence(newEvidence);
                  }}
                  placeholder="URL ou caminho"
                  className="flex-1 px-2 py-1.5 bg-bg-secondary rounded border border-border-default text-xs focus:outline-none focus:border-[#6366f1]"
                />
                <button
                  onClick={() => setEvidence(evidence.filter((_, i) => i !== idx))}
                  className="p-1.5 text-text-muted hover:text-red-400"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-bg-secondary rounded-lg text-text-muted hover:text-text-primary transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!grounds || !justification}
            className="flex-1 px-4 py-2 bg-[#6366f1] rounded-lg text-white hover:bg-[#4f46e5] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={14} />
            Submeter
          </button>
        </div>
      </motion.div>
    </div>
  );
}
