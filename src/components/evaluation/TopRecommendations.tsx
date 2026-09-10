import { motion } from 'framer-motion';
import { Trophy, ArrowRight } from 'lucide-react';
import { useEvaluationStore } from '../../stores/useEvaluationStore';
import {
  calculateOverallScore,
  getPriorityFromScore,
  RECOMMENDATION_INFO,
} from '../../types/agentEvaluation';

const priorityColors = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#94a3b8',
};

export function TopRecommendations() {
  const { evaluations } = useEvaluationStore();

  // Get top 5 by score
  const topAgents = [...evaluations]
    .sort((a, b) => calculateOverallScore(b) - calculateOverallScore(a))
    .slice(0, 5);

  if (topAgents.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-[#fbbf24]" />
        <h3 className="text-base font-semibold text-text-primary">
          Top 5 Prioridades
        </h3>
        <span className="text-xs text-text-dim ml-auto">
          Ordenado por score geral
        </span>
      </div>

      <div className="space-y-2">
        {topAgents.map((agent, idx) => {
          const score = calculateOverallScore(agent);
          const priority = getPriorityFromScore(score);
          const recInfo = RECOMMENDATION_INFO[agent.recommendation];

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex items-center gap-3 p-3 bg-bg-secondary/30 hover:bg-bg-secondary/60 rounded-lg border border-border-default/50 hover:border-border-default transition-all cursor-pointer"
            >
              {/* Rank */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0`}
                style={{
                  backgroundColor:
                    idx === 0
                      ? '#fbbf2420'
                      : idx === 1
                      ? '#94a3b820'
                      : idx === 2
                      ? '#a1620720'
                      : '#1e1e2e',
                  color:
                    idx === 0
                      ? '#fbbf24'
                      : idx === 1
                      ? '#cbd5e1'
                      : idx === 2
                      ? '#a16207'
                      : '#64748b',
                }}
              >
                {idx + 1}
              </div>

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  backgroundColor: `${recInfo.color}20`,
                  color: recInfo.color,
                }}
              >
                {recInfo.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {agent.name}
                  </span>
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: priorityColors[priority] }}
                  >
                    {priority}
                  </span>
                </div>
                <div className="text-xs text-text-muted truncate">
                  {agent.recommendation === 'integrate_now' ? recInfo.label :
                   agent.recommendation === 'replace_existing' ? recInfo.label :
                   agent.recommendation === 'consolidate' ? recInfo.label :
                   agent.recommendation === 'integrate_later' ? recInfo.label :
                   recInfo.label}
                  {' • '}
                  {agent.source}
                </div>
              </div>

              {/* Score */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span
                  className="text-2xl font-bold leading-none"
                  style={{ color: priorityColors[priority] }}
                >
                  {score}
                </span>
                <span className="text-xs text-text-dim mt-0.5">/ 100</span>
              </div>

              {/* Arrow on hover */}
              <ArrowRight
                size={16}
                className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
