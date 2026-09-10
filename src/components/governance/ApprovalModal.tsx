import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  Edit3,
  AlertTriangle,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  ExternalLink,
} from 'lucide-react';
import { ApprovalItem } from '../../types/governance';

interface ApprovalModalProps {
  item: ApprovalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestRevision: (id: string, feedback: string) => void;
}

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram size={24} className="text-pink-400" />,
  linkedin: <Linkedin size={24} className="text-blue-400" />,
  whatsapp: <MessageCircle size={24} className="text-green-400" />,
  email: <Mail size={24} className="text-purple-400" />,
  blog: <ExternalLink size={24} className="text-cyan-400" />,
  tiktok: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  ),
};

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRequestRevision,
}) => {
  const [feedback, setFeedback] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  if (!item) return null;

  const handleSubmitRevision = () => {
    if (feedback.trim()) {
      onRequestRevision(item.id, feedback);
      setFeedback('');
      setShowRevisionForm(false);
    }
  };

  const handleApprove = () => {
    onApprove(item.id);
    onClose();
  };

  const handleReject = () => {
    onReject(item.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-bg-card border border-border-default rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center">
                  {platformIcons[item.type] || <Instagram size={24} />}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Revisar {item.title}
                  </h2>
                  <p className="text-sm text-text-muted">{item.account}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X size={20} className="text-text-dim" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Full Copy */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-2 uppercase tracking-wide">
                  Copy Completo
                </h3>
                <div className="bg-bg-secondary rounded-xl p-4">
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                    {item.content.copy}
                  </p>
                </div>
              </div>

              {/* Media Preview */}
              {item.content.thumbnail && (
                <div>
                  <h3 className="text-sm font-medium text-text-muted mb-2 uppercase tracking-wide">
                    Midia
                  </h3>
                  <div className="flex gap-4">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-bg-secondary">
                      <img
                        src={item.content.thumbnail}
                        alt="Media preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {item.content.cta && (
                      <div className="flex-1 flex items-center">
                        <div className="bg-bg-secondary rounded-xl p-4">
                          <p className="text-xs text-text-dim mb-1">Call-to-Action</p>
                          <p className="text-sm font-medium text-text-primary">
                            {item.content.cta}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scheduling Info */}
              {item.content.scheduledTime && (
                <div className="flex items-center gap-4">
                  <div className="bg-bg-secondary rounded-xl px-4 py-2">
                    <p className="text-xs text-text-dim">Agendado para</p>
                    <p className="text-sm font-medium text-text-primary">
                      {item.content.scheduledTime}
                    </p>
                  </div>
                  {item.content.platform && (
                    <div className="bg-bg-secondary rounded-xl px-4 py-2">
                      <p className="text-xs text-text-dim">Plataforma</p>
                      <p className="text-sm font-medium text-text-primary">
                        {item.content.platform}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Guardian Alerts */}
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Alertas do Guardian
                </h3>
                <div className="space-y-2">
                  {item.guardianAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg
                        ${alert.status === 'warning' ? 'bg-[#fbbf24]/10' : 'bg-[#22c55e]/10'}
                      `}
                    >
                      {alert.status === 'warning' ? (
                        <AlertTriangle size={18} className="text-[#fbbf24]" />
                      ) : (
                        <Check size={18} className="text-[#22c55e]" />
                      )}
                      <span
                        className={`text-sm ${
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

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-bg-secondary rounded-xl p-4">
                  <p className="text-xs text-text-dim mb-1">Checksum</p>
                  <p className="text-xs font-mono text-[#06b6d4] break-all">
                    {item.checksum}
                  </p>
                </div>
                <div className="bg-bg-secondary rounded-xl p-4">
                  <p className="text-xs text-text-dim mb-1">Fontes Consultadas</p>
                  <p className="text-sm font-medium text-text-primary">
                    {item.sourcesCount} fontes
                  </p>
                </div>
              </div>

              {/* Created by */}
              <div className="bg-bg-secondary rounded-xl p-4">
                <p className="text-xs text-text-dim mb-1">Criado por</p>
                <p className="text-sm font-medium text-text-primary">
                  {item.agents.join(' + ')}
                </p>
              </div>

              {/* Revision Form */}
              {showRevisionForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
                    Feedback para Revisao
                  </h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Descreva as alteracoes necessarias..."
                    className="w-full h-32 bg-bg-secondary rounded-xl p-4 text-sm text-text-primary placeholder-text-dim resize-none border border-border-default focus:border-primary focus:outline-none"
                  />
                </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-border-default bg-bg-secondary/50">
              <div className="flex gap-2">
                {!showRevisionForm ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleApprove}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#22c55e] hover:bg-[#22c55e]/90 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Check size={18} />
                      Aprovar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReject}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <X size={18} />
                      Rejeitar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRevisionForm(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-bg-card hover:bg-border-default text-text-primary text-sm font-medium rounded-lg border border-border-default transition-colors"
                    >
                      <Edit3 size={18} />
                      Solicitar Revisao
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitRevision}
                      disabled={!feedback.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-bg-primary text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit3 size={18} />
                      Enviar Revisao
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowRevisionForm(false);
                        setFeedback('');
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-bg-card hover:bg-border-default text-text-primary text-sm font-medium rounded-lg border border-border-default transition-colors"
                    >
                      <X size={18} />
                      Cancelar
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
