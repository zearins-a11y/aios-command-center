import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock, User, CheckCircle2 } from 'lucide-react';
import { useStrikeStore } from '../../stores/useStrikeStore';
import { getStrikeLevelInfo } from '../../utils/strikeSystem';
import { AgentRole } from '../../types/governance';

interface StrikeBadgeProps {
  agentId: AgentRole;
  agentName: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function StrikeBadge({ agentId, agentName, size = 'md', showCount = true }: StrikeBadgeProps) {
  const getStrikeLevel = useStrikeStore((state) => state.getStrikeLevel);
  const getRecentStrikeCount = useStrikeStore((state) => state.getRecentStrikeCount);

  const level = getStrikeLevel(agentId);
  const count = getRecentStrikeCount(agentId);
  const info = getStrikeLevelInfo(level);

  if (level === 'none') return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: info.bgColor,
        color: info.color,
        border: `1px solid ${info.color}40`,
      }}
      title={`${agentName}: ${info.description}`}
    >
      <span>{info.icon}</span>
      {showCount && count > 0 && (
        <span className="font-bold">{count}</span>
      )}
      <span className="opacity-75 hidden sm:inline">{info.label.replace(/[⚠️🟡🔴❌✅]/g, '').trim()}</span>
    </motion.div>
  );
}

interface StrikePanelProps {
  compact?: boolean;
}

export function StrikePanel({ compact = false }: StrikePanelProps) {
  const { getAllStrikeSummaries, strikes, resolveStrike, addStrike } = useStrikeStore();

  const summaries = getAllStrikeSummaries();
  const activeIssues = summaries.filter((s) => s.level !== 'none');

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Strike System
          </h3>
          <span className="text-xs text-text-dim">
            {activeIssues.length} alerta{activeIssues.length !== 1 ? 's' : ''}
          </span>
        </div>

        {activeIssues.length === 0 ? (
          <div className="text-center py-6 text-text-muted">
            <CheckCircle2 size={24} className="mx-auto mb-2 opacity-30 text-green-400" />
            <p className="text-xs">Todos os agentes estão limpos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeIssues.map((summary) => {
              const info = getStrikeLevelInfo(summary.level);
              return (
                <div
                  key={summary.agentId}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: info.bgColor,
                    borderColor: `${info.color}40`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{info.icon}</span>
                      <span className="text-sm font-semibold text-text-primary">
                        {summary.agentName}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: info.color }}
                    >
                      {summary.recentStrikes}x
                    </span>
                  </div>
                  <div className="text-xs text-text-muted">
                    {info.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Sistema de Strikes
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Progressive warnings para agentes que violam regras repetidamente
          </p>
        </div>
        <div className="text-xs text-text-dim">
          Janela: 90 dias
        </div>
      </div>

      {/* All Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {summaries.map((summary) => {
          const info = getStrikeLevelInfo(summary.level);
          const isClean = summary.level === 'none';

          return (
            <motion.div
              key={summary.agentId}
              layout
              className={`p-4 rounded-xl border transition-all ${
                isClean
                  ? 'bg-bg-card border-border-default'
                  : 'border-2'
              }`}
              style={!isClean ? {
                backgroundColor: info.bgColor,
                borderColor: `${info.color}60`,
              } : {}}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: `${info.color}20`,
                      color: info.color,
                    }}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {summary.agentName}
                    </div>
                    <div className="text-xs text-text-dim">
                      {isClean ? 'Sem strikes' : `${summary.recentStrikes} strike${summary.recentStrikes !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Badge */}
              <div className="mb-3">
                <span
                  className="inline-block text-xs font-semibold px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: `${info.color}20`,
                    color: info.color,
                  }}
                >
                  {info.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-text-muted leading-relaxed mb-3">
                {info.description}
              </p>

              {/* Action */}
              <div className="text-xs text-text-dim flex items-start gap-1.5 mb-2">
                <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                <span>{info.action}</span>
              </div>

              {/* Days Since Last */}
              {summary.daysSinceLastViolation !== null && (
                <div className="text-xs text-text-dim flex items-center gap-1.5 pt-2 border-t border-border-default">
                  <Clock size={12} />
                  <span>
                    Último strike: há {summary.daysSinceLastViolation} dia{summary.daysSinceLastViolation !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              {!isClean && (
                <div className="mt-3 pt-3 border-t border-border-default flex gap-2">
                  <button
                    onClick={() => {
                      const latestStrike = strikes.find((s) => s.agentId === summary.agentId);
                      if (latestStrike) {
                        resolveStrike(latestStrike.id, 'Você', 'Resolvido manualmente');
                      }
                    }}
                    className="flex-1 text-xs px-2 py-1.5 bg-bg-card border border-border-default rounded text-text-muted hover:text-text-primary hover:border-[#22c55e] transition-colors"
                  >
                    <CheckCircle2 size={10} className="inline mr-1" />
                    Resolver
                  </button>
                  <button
                    onClick={() => {
                      addStrike({
                        agentId: summary.agentId,
                        agentName: summary.agentName,
                        level: 'warning',
                        reason: 'Strike manual adicionado pelo operador',
                      });
                    }}
                    className="flex-1 text-xs px-2 py-1.5 bg-bg-card border border-border-default rounded text-text-muted hover:text-text-primary hover:border-red-500 transition-colors"
                  >
                    + Strike
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      {strikes.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            Histórico de Strikes
          </h4>
          <div className="space-y-2">
            {strikes.slice(0, 10).map((strike) => {
              const info = getStrikeLevelInfo(strike.level);
              const isResolved = !!strike.resolvedAt;
              return (
                <motion.div
                  key={strike.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${
                    isResolved
                      ? 'bg-bg-card border-border-default opacity-60'
                      : 'border-border-default'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{
                        backgroundColor: info.bgColor,
                        color: info.color,
                      }}
                    >
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text-primary">
                          {strike.agentName}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: info.bgColor,
                            color: info.color,
                          }}
                        >
                          {info.label.replace(/[⚠️🟡🔴❌✅]/g, '').trim()}
                        </span>
                        {isResolved && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            Resolvido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {strike.reason}
                      </p>
                      {strike.notes && (
                        <p className="text-xs text-text-dim italic mt-1">
                          💬 {strike.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-dim">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(strike.timestamp).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {strike.resolvedBy && (
                          <span className="flex items-center gap-1">
                            <User size={10} />
                            {strike.resolvedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
