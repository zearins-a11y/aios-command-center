import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Info, TrendingUp, CheckCircle2, Edit3, XCircle, BarChart3 } from 'lucide-react';
import { FeedbackLoopPanel } from '../components/governance/FeedbackLoopPanel';

export const FeedbackLoop: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center">
                <RefreshCw size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Feedback Loop
                </h1>
                <p className="text-sm text-text-muted">
                  Decisões humanas alimentam melhoria contínua dos agentes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-6 p-4 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[#06b6d4] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-1">
              Como funciona o Feedback Loop
            </p>
            <p>
              Cada decisão humana (aprovar, modificar ou rejeitar) gera um sinal de feedback que é
              categorizado por padrão de erro. Os agentes recebem esses insights para melhorar continuamente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <CheckCircle2 size={14} className="text-green-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Aprovação</div>
                  <div className="text-xs text-text-muted">Confirma que o agente acertou</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Edit3 size={14} className="text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Modificação</div>
                  <div className="text-xs text-text-muted">Ajuda a entender o que ajustar</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <XCircle size={14} className="text-red-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Rejeição</div>
                  <div className="text-xs text-text-muted">Identifica padrões problemáticos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-card border border-border-default rounded-xl p-6"
        >
          <FeedbackLoopPanel />
        </motion.div>

        {/* Patterns Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#a855f7]" />
            Padrões de Feedback
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <PatternCard icon="🎭" title="Problemas de Tom" description="Tom inadequado para o público" />
            <PatternCard icon="❌" title="Erro Factual" description="Informação incorreta" />
            <PatternCard icon="🛡️" title="Compliance" description="Violação de políticas" />
            <PatternCard icon="📝" title="Formato" description="Erro de gramática/ortografia" />
            <PatternCard icon="♿" title="Acessibilidade" description="Falta alt text, contraste" />
            <PatternCard icon="🎯" title="Voz da Marca" description="Não соответствует a marca" />
            <PatternCard icon="⚖️" title="Risco Legal" description="Potencial problema jurídico" />
            <PatternCard icon="📊" title="Engajamento" description="Baixa probabilidade de interação" />
          </div>
        </motion.div>

        {/* How to Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            Como Usar o Feedback Loop
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Revise saídas de agentes</div>
                <div className="text-xs text-text-muted mt-1">
                  Ao aprovar, modificar ou rejeitar uma saída, o sistema registra automaticamente o feedback.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Categorize o padrão</div>
                <div className="text-xs text-text-muted mt-1">
                  Identifique o tipo de problema (tom, factual, compliance, etc.) para que o agente saiba o que melhorar.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Acompanhe métricas</div>
                <div className="text-xs text-text-muted mt-1">
                  Monitore a taxa de aprovação por agente, identifique padrões recorrentes e acompanhe a tendência de melhoria.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                4
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary">Agentes aprendem</div>
                <div className="text-xs text-text-muted mt-1">
                  Com o tempo, agentes com alto volume de feedback específico melhoram suas saídas automaticamente.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface PatternCardProps {
  icon: string;
  title: string;
  description: string;
}

function PatternCard({ icon, title, description }: PatternCardProps) {
  return (
    <div className="p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium text-text-primary">{title}</span>
      </div>
      <p className="text-xs text-text-muted">{description}</p>
    </div>
  );
}
