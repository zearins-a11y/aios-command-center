import { motion } from 'framer-motion';
import { useEvaluationStore } from '../../stores/useEvaluationStore';
import { SOURCE_INFO, calculateOverallScore } from '../../types/agentEvaluation';

interface ComparisonChartProps {
  height?: number;
}

export function SourceComparisonChart({ height = 280 }: ComparisonChartProps) {
  const { evaluations } = useEvaluationStore();

  const sourceData = Object.entries(SOURCE_INFO).map(([source, info]) => {
    const sourceAgents = evaluations.filter((e) => e.source === source);
    const count = sourceAgents.length;
    const avgScore = count > 0
      ? Math.round(
          sourceAgents.reduce((sum, e) => sum + calculateOverallScore(e), 0) / count
        )
      : 0;
    const needed = sourceAgents.filter((e) => e.status === 'needed').length;
    const duplicate = sourceAgents.filter((e) => e.status === 'duplicate').length;
    const haveIt = sourceAgents.filter((e) => e.status === 'have_it').length;

    return {
      source: source as keyof typeof SOURCE_INFO,
      info,
      count,
      avgScore,
      needed,
      duplicate,
      haveIt,
      agents: sourceAgents,
    };
  });

  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-6" style={{ minHeight: height }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Comparativo de Fontes
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Distribuição de agentes por fonte
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sourceData.map((data, idx) => {
          const hasAgents = data.count > 0;
          return (
            <motion.div
              key={data.source}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative overflow-hidden rounded-xl border border-border-default bg-bg-secondary/30 p-4"
            >
              {/* Background gradient based on source color */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  background: `linear-gradient(135deg, ${data.info.color} 0%, transparent 100%)`,
                }}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: `${data.info.color}20`,
                      color: data.info.color,
                    }}
                  >
                    {data.info.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-primary">
                      {data.info.label}
                    </div>
                    <div className="text-xs text-text-muted">
                      {data.count} agente{data.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Score */}
                {hasAgents && (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-3xl font-bold"
                        style={{ color: data.info.color }}
                      >
                        {data.avgScore}
                      </span>
                      <span className="text-xs text-text-dim">avg score</span>
                    </div>

                    {/* Score bar */}
                    <div className="mt-2 h-1.5 bg-bg-card rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.avgScore}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: data.info.color }}
                      />
                    </div>
                  </div>
                )}

                {/* Status breakdown */}
                {hasAgents && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-400">{data.haveIt}</div>
                      <div className="text-xs text-text-dim">Temos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-400">{data.needed}</div>
                      <div className="text-xs text-text-dim">Gap</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-400">{data.duplicate}</div>
                      <div className="text-xs text-text-dim">Dupl.</div>
                    </div>
                  </div>
                )}

                {!hasAgents && (
                  <div className="text-center py-4 text-xs text-text-dim">
                    Sem agentes avaliados
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
