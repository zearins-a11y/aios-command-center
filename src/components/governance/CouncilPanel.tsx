import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Minus,
  HelpCircle,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { useCouncilStore, COUNCIL_SPECIALTY_LABELS, COUNCIL_ROLE_LABELS, COUNCIL_STATUS_LABELS } from '../../stores/useCouncilStore';
import {
  CouncilMember,
  CouncilCase,
  CouncilOpinion,
  COUNCIL_POSITION_LABELS,
  calculateCouncilDecision,
  getCaseUrgencyColor,
} from '../../utils/councilConsultive';

// Member Card Component
function MemberCard({ member }: { member: CouncilMember }) {
  const roleColors = {
    chair: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    member: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    observer: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
  };

  const colors = roleColors[member.role];
  const availabilityColors = {
    available: 'bg-green-500',
    limited: 'bg-yellow-500',
    unavailable: 'bg-red-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-bg-card border border-border-default rounded-xl"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & Role */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text-primary truncate">{member.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
              {COUNCIL_ROLE_LABELS[member.role]}
            </span>
          </div>

          {/* Title */}
          <div className="text-xs text-text-muted mb-2">
            {member.title} • {member.organization}
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-2">
            {member.specialties.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 bg-bg-secondary rounded">
                {COUNCIL_SPECIALTY_LABELS[s]}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {member.casesReviewed} casos
            </span>
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {member.opinionsIssued} pareceres
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${availabilityColors[member.availability]}`} />
              {member.availability === 'available' ? 'Disponível' : member.availability === 'limited' ? 'Limitado' : 'Indisponível'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Case Card Component
function CaseCard({ councilCase }: { councilCase: CouncilCase }) {
  const [expanded, setExpanded] = useState(false);
  const colors = getCaseUrgencyColor(councilCase.priority);
  const decision = calculateCouncilDecision(councilCase.opinions);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl border overflow-hidden ${colors.bg} ${colors.border}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Status & Priority */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                {councilCase.priority === 'urgent' ? '⚡ Urgente' : councilCase.priority === 'elevated' ? '↑ Elevado' : 'Normal'}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-bg-secondary text-text-muted border border-border-default">
                {COUNCIL_STATUS_LABELS[councilCase.status]}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-text-primary mb-1 truncate">
              {councilCase.referenceTitle}
            </h3>

            {/* Summary */}
            <p className="text-xs text-text-muted line-clamp-2">
              {councilCase.summary}
            </p>

            {/* Assigned Members */}
            <div className="flex items-center gap-2 mt-2">
              <User size={12} className="text-text-muted" />
              <span className="text-xs text-text-muted">
                {councilCase.assignedTo.length} membro{councilCase.assignedTo.length !== 1 ? 's' : ''} atribuído{councilCase.assignedTo.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Opinions Count */}
          <div className="text-center px-3 py-1 bg-bg-secondary rounded-lg">
            <div className="text-lg font-bold text-text-primary">{councilCase.opinions.length}</div>
            <div className="text-xs text-text-muted">pareceres</div>
          </div>
        </div>

        {/* Deadline */}
        {councilCase.deadline && (
          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <Clock size={12} />
            <span>Prazo: {new Date(councilCase.deadline).toLocaleString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}</span>
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
              {/* Context */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Contexto
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {councilCase.context}
                </p>
              </div>

              {/* Questions */}
              {councilCase.questions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                    Perguntas ({councilCase.questions.length})
                  </h4>
                  <ul className="space-y-1">
                    {councilCase.questions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-[#6366f1]">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Opinions */}
              {councilCase.opinions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Pareceres ({councilCase.opinions.length})
                  </h4>
                  <div className="space-y-2">
                    {councilCase.opinions.map((opinion) => (
                      <div key={opinion.id} className="p-3 bg-bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-text-primary">{opinion.memberName}</span>
                          <PositionBadge position={opinion.position} />
                          <span className="text-xs text-text-muted">({opinion.confidence}%)</span>
                        </div>
                        <p className="text-xs text-text-secondary mb-1">{opinion.opinion}</p>
                        {opinion.suggestions.length > 0 && (
                          <div className="text-xs text-text-muted">
                            <span className="font-medium">Sugestões: </span>
                            {opinion.suggestions.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Summary */}
              {decision.confidence > 0 && (
                <div className={`p-3 rounded-lg border ${decision.isUnanimous ? 'border-green-500/30 bg-green-500/10' : 'border-border-default'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Decisão:</span>
                    <span className={`text-sm font-semibold ${
                      decision.recommendation === 'approve' ? 'text-green-400' :
                      decision.recommendation === 'reject' ? 'text-red-400' :
                      decision.recommendation === 'modify' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {decision.recommendation === 'approve' ? 'Aprovado' :
                       decision.recommendation === 'reject' ? 'Rejeitado' :
                       decision.recommendation === 'modify' ? 'Modificar' :
                       decision.recommendation === 'escalate' ? 'Escalar' : 'Sem ação'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-muted">Confiança:</span>
                    <span className="text-xs font-medium text-text-primary">{decision.confidence}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {decision.isUnanimous && (
                      <span className="text-xs text-green-400">✓ Unânime</span>
                    )}
                    {decision.isConsensus && (
                      <span className="text-xs text-blue-400">• Consenso</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Position Badge Helper
function PositionBadge({ position }: { position: CouncilOpinion['position'] }) {
  const config = {
    in_favor: { icon: <CheckCircle2 size={12} />, color: 'text-green-400', bg: 'bg-green-500/10' },
    against: { icon: <XCircle size={12} />, color: 'text-red-400', bg: 'bg-red-500/10' },
    abstain: { icon: <Minus size={12} />, color: 'text-gray-400', bg: 'bg-gray-500/10' },
    needs_more_info: { icon: <HelpCircle size={12} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  };

  const c = config[position];

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${c.bg} ${c.color}`}>
      {c.icon}
      {COUNCIL_POSITION_LABELS[position]}
    </span>
  );
}

// Main Panel Component
interface CouncilPanelProps {
  compact?: boolean;
}

export function CouncilPanel({ compact = false }: CouncilPanelProps) {
  const {
    cases,
    caseStatusFilter,
    setCaseStatusFilter,
    getPendingCases,
    getActiveMembers,
    getOverallStats,
  } = useCouncilStore();

  const pendingCases = getPendingCases();
  const activeMembers = getActiveMembers();
  const stats = getOverallStats();
  const filteredCases = caseStatusFilter === 'all'
    ? cases
    : cases.filter((c) => c.status === caseStatusFilter);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Conselho Consultivo
          </h3>
          {pendingCases.length > 0 && (
            <span className="text-xs text-text-dim">
              {pendingCases.length} pendente{pendingCases.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {pendingCases.length === 0 ? (
          <div className="text-center py-6 text-text-muted">
            <Users size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Nenhum caso pendente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingCases.slice(0, 3).map((c) => (
              <CaseCard key={c.id} councilCase={c} />
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
            Conselho Consultivo
          </h3>
          <p className="text-xs text-text-muted mt-1">
            P1 - Pool de revisores independentes para casos especiais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">
            {pendingCases.length} caso{pendingCases.length !== 1 ? 's' : ''} pendente{pendingCases.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-[#6366f1]" />
            <span className="text-xs text-text-muted">Membros</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats.activeMembers}/{stats.totalMembers}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-blue-400" />
            <span className="text-xs text-text-muted">Total Casos</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats.totalCases}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-yellow-400" />
            <span className="text-xs text-text-muted">Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pendingCases}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-green-400" />
            <span className="text-xs text-text-muted">Tempo Médio</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats.avgResolutionTime || 0}h</div>
        </div>
      </div>

      {/* Members Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-[#6366f1]" />
          <h4 className="text-sm font-semibold text-text-primary">Membros do Conselho</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending_assignment', 'assigned', 'under_review', 'opinion_issued', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setCaseStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              caseStatusFilter === status
                ? 'bg-[#6366f1] text-white'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary'
            }`}
          >
            {status === 'all' ? 'Todos' : COUNCIL_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredCases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-text-muted"
            >
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum caso encontrado</p>
            </motion.div>
          ) : (
            filteredCases.map((c) => (
              <CaseCard key={c.id} councilCase={c} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
