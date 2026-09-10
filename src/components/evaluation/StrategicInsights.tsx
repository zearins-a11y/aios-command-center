import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { useEvaluationStore } from '../../stores/useEvaluationStore';
import { calculateOverallScore } from '../../types/agentEvaluation';

interface Insight {
  type: 'opportunity' | 'risk' | 'success' | 'action';
  title: string;
  description: string;
  metric?: string;
  agents?: string[];
}

export function StrategicInsights() {
  const { evaluations } = useEvaluationStore();

  // Calculate insights
  const insights: Insight[] = [];

  // 1. Critical gaps
  const criticalGaps = evaluations.filter(
    (e) => e.status === 'needed' && calculateOverallScore(e) >= 60
  );
  if (criticalGaps.length > 0) {
    insights.push({
      type: 'risk',
      title: `${criticalGaps.length} gap${criticalGaps.length > 1 ? 's' : ''} crítico${criticalGaps.length > 1 ? 's' : ''} identificado${criticalGaps.length > 1 ? 's' : ''}`,
      description: 'Funcionalidades essenciais que ainda não temos cobertura. Priorize integrar antes de adicionar novos agentes.',
      metric: `${criticalGaps.length} gap${criticalGaps.length > 1 ? 's' : ''}`,
      agents: criticalGaps.slice(0, 3).map((g) => g.name),
    });
  }

  // 2. Top integration candidates
  const integrateNow = evaluations
    .filter((e) => e.recommendation === 'integrate_now')
    .sort((a, b) => calculateOverallScore(b) - calculateOverallScore(a))
    .slice(0, 3);
  if (integrateNow.length > 0) {
    insights.push({
      type: 'opportunity',
      title: `${integrateNow.length} agentes prontos para integrar`,
      description: 'Alto valor de negócio com baixo custo de manutenção. Devem ser integrados imediatamente.',
      metric: `${integrateNow.reduce((sum, e) => sum + (e.estimatedHours || 0), 0)}h estimadas`,
      agents: integrateNow.map((e) => e.name),
    });
  }

  // 3. Duplicates - consolidation opportunity
  const duplicates = evaluations.filter((e) => e.status === 'duplicate');
  if (duplicates.length > 0) {
    insights.push({
      type: 'action',
      title: `${duplicates.length} duplicata${duplicates.length > 1 ? 's' : ''} encontrada${duplicates.length > 1 ? 's' : ''}`,
      description: 'Agentes que duplicam capacidades existentes. Considere consolidar para reduzir complexidade.',
      metric: 'Consolidação',
      agents: duplicates.map((d) => d.name),
    });
  }

  // 4. High-value sources
  const sourceScores = Object.entries(
    evaluations.reduce((acc, e) => {
      acc[e.source] = acc[e.source] || [];
      acc[e.source].push(calculateOverallScore(e));
      return acc;
    }, {} as Record<string, number[]>)
  ).map(([source, scores]) => ({
    source,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  })).sort((a, b) => b.avg - a.avg);

  if (sourceScores.length > 0) {
    const top = sourceScores[0];
    insights.push({
      type: 'success',
      title: `Fonte com maior score médio: ${top.source}`,
      description: `Score médio de ${top.avg}/100. Esta é a fonte mais valiosa para nosso contexto atual.`,
      metric: `${top.avg}/100`,
    });
  }

  const icons = {
    opportunity: <TrendingUp size={18} className="text-blue-400" />,
    risk: <AlertTriangle size={18} className="text-red-400" />,
    success: <CheckCircle2 size={18} className="text-green-400" />,
    action: <Zap size={18} className="text-orange-400" />,
  };

  const colors = {
    opportunity: 'border-blue-500/30 bg-blue-500/5',
    risk: 'border-red-500/30 bg-red-500/5',
    success: 'border-green-500/30 bg-green-500/5',
    action: 'border-orange-500/30 bg-orange-500/5',
  };

  const labels = {
    opportunity: 'Oportunidade',
    risk: 'Risco',
    success: 'Sucesso',
    action: 'Ação',
  };

  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-[#6366f1]" />
        <h3 className="text-base font-semibold text-text-primary">
          Insights Estratégicos
        </h3>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <Target size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sem insights disponíveis ainda.</p>
          <p className="text-xs text-text-dim mt-1">
            Continue avaliando agentes para gerar recomendações.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border ${colors[insight.type]}`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0 mt-0.5">{icons[insight.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                      {labels[insight.type]}
                    </span>
                    {insight.metric && (
                      <span className="text-xs px-2 py-0.5 bg-bg-card rounded-full text-text-primary">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>

              {insight.agents && insight.agents.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {insight.agents.map((agent, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-bg-card border border-border-default rounded text-text-muted"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
