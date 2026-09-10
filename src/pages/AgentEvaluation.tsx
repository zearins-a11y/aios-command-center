import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, BookOpen, AlertCircle } from 'lucide-react';
import { EvaluationPanel } from '../components/evaluation/EvaluationPanel';
import { SourceComparisonChart } from '../components/evaluation/SourceComparisonChart';
import { StrategicInsights } from '../components/evaluation/StrategicInsights';
import { TopRecommendations } from '../components/evaluation/TopRecommendations';

export const AgentEvaluation: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <ClipboardCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Avaliação de Agentes
                </h1>
                <p className="text-sm text-text-muted">
                  Análise de gaps, redundâncias e oportunidades de integração
                </p>
              </div>
            </div>

            {/* Info badge */}
            <a
              href="/AGENCY_AGENTS_EVALUATION.md"
              className="flex items-center gap-2 px-3 py-2 bg-bg-card border border-border-default rounded-lg hover:border-[#6366f1]/50 transition-colors"
            >
              <BookOpen size={14} className="text-text-muted" />
              <span className="text-xs text-text-muted">Relatório Completo</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-[#6366f1] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              Sobre este painel
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Este painel consolida todos os agentes identificados em diferentes fontes (AIOS, XQuads, projetos locais e repositórios GitHub) para identificar gaps, redundâncias e oportunidades de consolidação. Use os filtros para explorar por fonte, categoria ou prioridade de integração.
            </p>
          </div>
        </motion.div>

        {/* Top: Source comparison + Top Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SourceComparisonChart />
          </div>
          <div>
            <TopRecommendations />
          </div>
        </div>

        {/* Strategic Insights */}
        <StrategicInsights />

        {/* Main Evaluation Panel */}
        <EvaluationPanel />
      </div>
    </div>
  );
};
