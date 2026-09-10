import React from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Link2,
  Trash2,
  Clock,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { SensitiveAction } from '../../types/governance';

interface SensitiveActionsProps {
  actions: SensitiveAction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  payment: <CreditCard size={18} className="text-[#fbbf24]" />,
  connection: <Link2 size={18} className="text-[#6366f1]" />,
  deletion: <Trash2 size={18} className="text-[#ef4444]" />,
};

const statusConfig: Record<
  string,
  {
    icon: React.ReactNode;
    badge: string;
    label: string;
    color: string;
  }
> = {
  awaiting_human: {
    icon: <Clock size={14} />,
    badge: 'bg-[#fbbf24]/20 text-[#fbbf24] border-[#fbbf24]/30',
    label: 'Aguardando Voce',
    color: '#fbbf24',
  },
  awaiting_clevel: {
    icon: <AlertCircle size={14} />,
    badge: 'bg-[#6366f1]/20 text-[#6366f1] border-[#6366f1]/30',
    label: 'Aguardando C-Level',
    color: '#6366f1',
  },
  in_delay: {
    icon: <Loader2 size={14} className="animate-spin" />,
    badge: 'bg-[#94a3b8]/20 text-[#94a3b8] border-[#94a3b8]/30',
    label: 'Em Delay',
    color: '#94a3b8',
  },
  approved: {
    icon: <Check size={14} />,
    badge: 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30',
    label: 'Aprovado',
    color: '#22c55e',
  },
  rejected: {
    icon: <X size={14} />,
    badge: 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30',
    label: 'Rejeitado',
    color: '#ef4444',
  },
};

export const SensitiveActions: React.FC<SensitiveActionsProps> = ({
  actions,
  onApprove,
  onReject,
}) => {
  const getDelayRemaining = (action: SensitiveAction) => {
    if (!action.delayHours || !action.delayStartedAt) return null;
    const elapsed = Date.now() - action.delayStartedAt.getTime();
    const total = action.delayHours * 60 * 60 * 1000;
    const remaining = total - elapsed;
    if (remaining <= 0) return 'Delay concluido';
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}min restantes`;
  };

  if (actions.length === 0) {
    return (
      <div className="bg-bg-card border border-border-default rounded-xl p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center">
            <Check size={24} className="text-[#22c55e]" />
          </div>
          <p className="text-text-muted text-sm">
            Nenhuma acao sensivel pendente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action, index) => {
        const config = statusConfig[action.status];
        const icon = actionIcons[action.type] || <AlertCircle size={18} />;
        const delayRemaining = getDelayRemaining(action);
        const canAct =
          action.status === 'awaiting_human' || action.status === 'awaiting_clevel';

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-bg-card border border-border-default rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center">
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-text-primary truncate">
                    {action.description}
                  </h4>
                  <span
                    className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${config.badge}`}
                  >
                    {config.icon}
                    {config.label}
                  </span>
                </div>

                {/* Value if exists */}
                {action.value && (
                  <p className="text-lg font-bold text-[#fbbf24] mb-2">
                    {action.value}
                  </p>
                )}

                {/* Approvers */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-dim mb-2">
                  {action.confirmedApprovals.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Check size={12} className="text-[#22c55e]" />
                      <span>Aprovados: {action.confirmedApprovals.join(', ')}</span>
                    </div>
                  )}
                  {action.awaitingApproval.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-[#fbbf24]" />
                      <span>Aguardando: {action.awaitingApproval.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Delay info */}
                {delayRemaining && (
                  <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] mb-3">
                    <Clock size={12} />
                    <span>{delayRemaining}</span>
                  </div>
                )}

                {/* Actions */}
                {canAct && (
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onApprove(action.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22c55e] hover:bg-[#22c55e]/90 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Check size={14} />
                      Aprovar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onReject(action.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary hover:bg-border-default text-text-primary text-xs font-medium rounded-lg border border-border-default transition-colors"
                    >
                      <X size={14} />
                      Rejeitar
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
