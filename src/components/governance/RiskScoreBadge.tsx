import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { RiskScore } from '../../types/governance';
import { getRiskColor, getRiskRecommendation } from '../../utils/crossCheckRanker';

interface RiskScoreBadgeProps {
  score: RiskScore;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export function RiskScoreBadge({ score, size = 'md', showBreakdown = false }: RiskScoreBadgeProps) {
  const color = getRiskColor(score.rank);
  const recommendation = getRiskRecommendation(score);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const rankLabels = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Médio',
    low: 'Baixo',
  };

  return (
    <div className="space-y-2">
      {/* Main Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
        style={{
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}40`,
        }}
      >
        {score.rank === 'critical' ? (
          <AlertTriangle size={iconSizes[size]} />
        ) : (
          <Shield size={iconSizes[size]} />
        )}
        <span className="font-semibold">{score.total}</span>
        <span className="opacity-75">/ 100</span>
      </motion.div>

      {/* Rank Label */}
      <div
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ml-2`}
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        {rankLabels[score.rank]}
      </div>

      {/* Breakdown Panel */}
      {showBreakdown && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
        >
          <div className="text-xs text-slate-400 mb-2 font-medium">Composição do Score</div>

          <div className="space-y-2">
            {/* Reach */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <TrendingUp size={12} />
                <span className="text-xs">Alcance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score.breakdown.reach / 30) * 100}%` }}
                    className="h-full bg-blue-500 rounded-full"
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">
                  {score.breakdown.reach.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Severity */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <AlertTriangle size={12} />
                <span className="text-xs">Severidade</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score.breakdown.severity / 40) * 100}%` }}
                    className="h-full bg-orange-500 rounded-full"
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">
                  {score.breakdown.severity.toFixed(1)}
                </span>
              </div>
            </div>

            {/* False Positive */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Shield size={12} />
                <span className="text-xs">Falso Positivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score.breakdown.falsePositive / 20) * 100}%` }}
                    className="h-full bg-purple-500 rounded-full"
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">
                  {score.breakdown.falsePositive.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Urgency */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock size={12} />
                <span className="text-xs">Urgência</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score.breakdown.urgency / 10) * 100}%` }}
                    className="h-full bg-green-500 rounded-full"
                    transition={{ duration: 0.5, delay: 0.4 }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">
                  {score.breakdown.urgency.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Weights */}
          <div className="mt-3 pt-2 border-t border-slate-700/50 text-xs text-slate-500">
            Pesos: Alcance 30% • Severidade 40% • F.P. 20% • Urgência 10%
          </div>

          {/* Recommendation */}
          <div className="mt-2 text-xs text-slate-400 italic">
            {recommendation}
          </div>
        </motion.div>
      )}
    </div>
  );
}
