import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, AlertTriangle, X, FileText, Send } from 'lucide-react';
import { AuditLogEntry } from '../../types/governance';

interface AuditLogProps {
  entries: AuditLogEntry[];
}

const resultConfig: Record<
  string,
  {
    icon: React.ReactNode;
    bg: string;
    text: string;
  }
> = {
  success: {
    icon: <Check size={12} />,
    bg: 'bg-[#22c55e]/20',
    text: 'text-[#22c55e]',
  },
  draft: {
    icon: <FileText size={12} />,
    bg: 'bg-[#94a3b8]/20',
    text: 'text-[#94a3b8]',
  },
  approved: {
    icon: <Check size={12} />,
    bg: 'bg-[#22c55e]/20',
    text: 'text-[#22c55e]',
  },
  published: {
    icon: <Send size={12} />,
    bg: 'bg-[#6366f1]/20',
    text: 'text-[#6366f1]',
  },
  rejected: {
    icon: <X size={12} />,
    bg: 'bg-[#ef4444]/20',
    text: 'text-[#ef4444]',
  },
  warning: {
    icon: <AlertTriangle size={12} />,
    bg: 'bg-[#fbbf24]/20',
    text: 'text-[#fbbf24]',
  },
};

export const AuditLog: React.FC<AuditLogProps> = ({ entries }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-bg-card border border-border-default rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-default bg-bg-secondary/50">
        <h3 className="text-sm font-semibold text-text-primary">
          Log de Auditoria
        </h3>
        <p className="text-xs text-text-dim mt-0.5">
          Ultimas 10 acoes registradas
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left text-[10px] font-medium text-text-dim uppercase tracking-wide px-4 py-2">
                <div className="flex items-center gap-1">
                  <Clock size={10} />
                  Hora
                </div>
              </th>
              <th className="text-left text-[10px] font-medium text-text-dim uppercase tracking-wide px-4 py-2">
                Agente
              </th>
              <th className="text-left text-[10px] font-medium text-text-dim uppercase tracking-wide px-4 py-2">
                Acao
              </th>
              <th className="text-left text-[10px] font-medium text-text-dim uppercase tracking-wide px-4 py-2">
                Checksum
              </th>
              <th className="text-left text-[10px] font-medium text-text-dim uppercase tracking-wide px-4 py-2">
                Aprovador
              </th>
              <th className="text-left text-[10px] font-medium text-text-dim uppercase tracking-wide px-4 py-2">
                Resultado
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const result = resultConfig[entry.result] || resultConfig.draft;

              return (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-border-default/50 hover:bg-bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-mono text-text-dim">
                      {formatTime(entry.timestamp)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-medium text-text-primary">
                      {entry.agent}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-text-muted">
                      {entry.action}
                    </span>
                    {entry.details && (
                      <span className="text-[10px] text-text-dim block mt-0.5">
                        {entry.details}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {entry.checksum ? (
                      <span className="text-xs font-mono text-[#06b6d4]">
                        {entry.checksum}
                      </span>
                    ) : (
                      <span className="text-xs text-text-dim">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {entry.approver ? (
                      <span className="text-xs text-[#6366f1]">
                        {entry.approver}
                      </span>
                    ) : (
                      <span className="text-xs text-text-dim">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${result.bg} ${result.text}`}
                    >
                      {result.icon}
                      {entry.result}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
