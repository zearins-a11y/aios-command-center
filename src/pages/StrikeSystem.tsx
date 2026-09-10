import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info } from 'lucide-react';
import { StrikePanel } from '../components/governance/StrikePanel';

export const StrikeSystem: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#f97316] flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Strike System
              </h1>
              <p className="text-sm text-text-muted">
                Sistema progressivo de warnings para agentes (P0 do Benchmark)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Como funciona o sistema de strikes?
            </h3>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Inspirado no YouTube, o sistema escalona automaticamente as consequências quando um agente causa bloqueios repetidos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <div>
                  <div className="font-semibold text-yellow-400">1ª violação</div>
                  <div className="text-text-muted">Warning + log + notificação</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🟡</span>
                <div>
                  <div className="font-semibold text-orange-400">2ª violação</div>
                  <div className="text-text-muted">Pausa + análise obrigatória</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">🔴</span>
                <div>
                  <div className="font-semibold text-red-400">3ª violação</div>
                  <div className="text-text-muted">Revisão de escopo + restrições</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base">❌</span>
                <div>
                  <div className="font-semibold text-red-600">4ª violação</div>
                  <div className="text-text-muted">Suspensão até revisão manual</div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-500/20 flex items-start gap-2 text-xs text-text-dim">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                <strong>Auto-reset:</strong> Agentes sem violações por 30 dias têm strikes resetados automaticamente.
                Janela de observação: 90 dias.
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StrikePanel />
        </motion.div>
      </div>
    </div>
  );
};
