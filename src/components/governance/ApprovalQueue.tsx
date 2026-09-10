import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  Clock,
  AlertTriangle,
  Check,
  X,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ApprovalItemWithScore } from '../../types/governance';
import { RiskScoreBadge } from './RiskScoreBadge';

interface ApprovalQueueProps {
  items: ApprovalItemWithScore[];
  onSelectItem: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestRevision: (id: string, feedback?: string) => void;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram size={18} className="text-pink-400" />,
  linkedin: <Linkedin size={18} className="text-blue-400" />,
  whatsapp: <MessageCircle size={18} className="text-green-400" />,
  email: <Mail size={18} className="text-purple-400" />,
  blog: <ExternalLink size={18} className="text-cyan-400" />,
  tiktok: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>,
};

const urgencyColors = {
  urgent: {
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-500',
    label: 'URGENTE',
  },
  normal: {
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'Normal',
  },
  low: {
    badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-400',
    label: 'Baixa',
  },
};

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  items,
  onSelectItem,
  onApprove,
  onReject,
  onRequestRevision: _onRequestRevision,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 60) return `Ha ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `Ha ${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Header with queue stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">
            <span className="text-lg font-bold text-text-primary">{items.length}</span> itens na fila
          </span>
          <div className="h-4 w-px bg-border-default" />
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-text-muted">
                {items.filter(i => i.riskScore.rank === 'critical').length} críticos
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-text-muted">
                {items.filter(i => i.riskScore.rank === 'high').length} altos
              </span>
            </span>
          </div>
        </div>
      </div>

      {items.map((item, index) => {
        const urgency = urgencyColors[item.urgency];
        const hasWarnings = item.guardianAlerts.some((a) => a.status === 'warning');
        const isExpanded = expandedItems.has(item.id);

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className={`
              relative bg-bg-card border rounded-xl overflow-hidden
              ${hasWarnings ? 'border-red-500/30' : 'border-border-default'}
              ${item.isEscalated ? 'ring-2 ring-[#ef4444]/30' : ''}
            `}
          >
            {/* Escalated indicator */}
            {item.isEscalated && (
              <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            )}
            {/* Urgency header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-default bg-bg-secondary/50">
              <div className="flex items-center gap-2">
                {hasWarnings && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${urgency.badge}`}>
                  {urgency.label}
                </span>
                <span className="text-text-dim text-xs">
                  {formatTimeAgo(item.pendingSince)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Risk Score Badge */}
                <RiskScoreBadge score={item.riskScore} size="sm" />
                <div className="flex items-center gap-2 text-text-dim">
                  <Clock size={14} />
                  <span className="text-xs">{item.content.scheduledTime || 'Agora'}</span>
                </div>
                {/* Expand toggle */}
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="p-1 rounded hover:bg-bg-secondary transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-text-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-text-muted" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Header row */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 mt-0.5">
                  {platformIcons[item.type] || <Instagram size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-muted">{item.account}</p>
                </div>
              </div>

              {/* Copy preview */}
              <div className="bg-bg-secondary rounded-lg p-3 mb-4">
                <p className="text-sm text-text-primary leading-relaxed">
                  {item.content.copy.length > 150
                    ? `${item.content.copy.substring(0, 150)}...`
                    : item.content.copy}
                </p>
              </div>

              {/* Thumbnail if exists */}
              {item.content.thumbnail && (
                <div className="mb-4 flex gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-bg-secondary">
                    <img
                      src={item.content.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.content.cta && (
                    <div className="flex-1 flex items-center">
                      <span className="text-sm text-text-muted">
                        <span className="text-text-dim">CTA:</span> {item.content.cta}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Guardian alerts */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                    Alertas do Guardian
                  </span>
                </div>
                <div className="space-y-1.5">
                  {item.guardianAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center gap-2">
                      {alert.status === 'warning' ? (
                        <AlertTriangle size={14} className="text-[#fbbf24]" />
                      ) : (
                        <Check size={14} className="text-[#22c55e]" />
                      )}
                      <span
                        className={`text-xs ${
                          alert.status === 'warning'
                            ? 'text-[#fbbf24]'
                            : 'text-[#22c55e]'
                        }`}
                      >
                        {alert.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Risk Breakdown */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <RiskScoreBadge score={item.riskScore} size="md" showBreakdown />
                </motion.div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-dim mb-4">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[#06b6d4]">
                    {item.checksum.substring(0, 12)}...
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  </svg>
                  <span>{item.sourcesCount} fontes consultadas</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span>{item.agents.join(' + ')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onApprove(item.id)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#22c55e] hover:bg-[#22c55e]/90 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Check size={16} />
                  Aprovar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onReject(item.id)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <X size={16} />
                  Rejeitar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectItem(item.id)}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-secondary hover:bg-border-default text-text-primary text-sm font-medium rounded-lg border border-border-default transition-colors"
                >
                  <Edit3 size={16} />
                  Solicitar Alt
                </motion.button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
