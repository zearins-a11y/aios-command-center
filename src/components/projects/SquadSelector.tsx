import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Info, AlertCircle, Plus } from 'lucide-react';
import { SquadSuggestion, getConfidenceColor, getConfidenceBg } from '../../types/workspaces';
import { Button } from '../ui';

interface SquadSelectorProps {
  suggestions: SquadSuggestion[];
  onToggleSquad: (squadId: string) => void;
  onViewDetails?: (squadId: string) => void;
}

export const SquadSelector: React.FC<SquadSelectorProps> = ({
  suggestions,
  onToggleSquad,
  onViewDetails,
}) => {
  const suggested = suggestions.filter((s) => s.status === 'suggested');
  const optional = suggestions.filter((s) => s.status === 'optional');
  const notRecommended = suggestions.filter((s) => s.status === 'not_recommended');
  const selected = suggestions.filter((s) => s.status === 'selected');

  return (
    <div className="space-y-6">
      {/* Suggested Squads */}
      {suggested.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-success" />
            <h3 className="text-sm font-semibold text-text-primary">
              SQUADS SUGERIDOS
            </h3>
            <span className="text-xs text-text-dim">(baseado em projetos similares)</span>
          </div>
          <div className="space-y-3">
            {suggested.map((squad, index) => (
              <motion.div
                key={squad.squadId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selected.some((s) => s.squadId === squad.squadId)
                    ? 'border-success bg-success/5'
                    : 'border-border-default bg-bg-card hover:border-border-hover'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{squad.icon}</span>
                    <div>
                      <h4 className="font-semibold text-text-primary">{squad.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getConfidenceBg(
                            squad.confidence
                          )} ${getConfidenceColor(squad.confidence)}`}
                        >
                          Confianca: {squad.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selected.some((s) => s.squadId === squad.squadId) ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => onToggleSquad(squad.squadId)}
                      icon={
                        selected.some((s) => s.squadId === squad.squadId) ? (
                          <Check className="w-4 h-4" />
                        ) : undefined
                      }
                    >
                      {selected.some((s) => s.squadId === squad.squadId) ? 'Incluido' : 'Incluir'}
                    </Button>
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(squad.squadId)}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text-muted">{squad.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Optional Squads */}
      {optional.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">SQUADS OPCIONAIS</h3>
          </div>
          <div className="space-y-3">
            {optional.map((squad, index) => (
              <motion.div
                key={squad.squadId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (suggested.length + index) * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  selected.some((s) => s.squadId === squad.squadId)
                    ? 'border-primary bg-primary/5'
                    : 'border-border-default bg-bg-secondary hover:border-border-hover'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{squad.icon}</span>
                    <div>
                      <h4 className="font-medium text-text-primary">{squad.name}</h4>
                      <p className="text-xs text-text-dim mt-1">
                        {squad.agentCount} agentes disponiveis
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={selected.some((s) => s.squadId === squad.squadId) ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => onToggleSquad(squad.squadId)}
                    icon={
                      selected.some((s) => s.squadId === squad.squadId) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )
                    }
                  >
                    {selected.some((s) => s.squadId === squad.squadId) ? 'Incluido' : 'Adicionar'}
                  </Button>
                </div>
                <p className="text-sm text-text-muted">{squad.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Not Recommended */}
      {notRecommended.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <X className="w-4 h-4 text-error" />
            <h3 className="text-sm font-semibold text-text-primary">
              NAO RECOMENDADOS
            </h3>
            <span className="text-xs text-text-dim">(justificativa)</span>
          </div>
          <div className="space-y-3">
            {notRecommended.map((squad, index) => (
              <motion.div
                key={squad.squadId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (suggested.length + optional.length + index) * 0.1 }}
                className="p-4 rounded-lg border border-border-default bg-bg-secondary opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl grayscale">{squad.icon}</span>
                    <div>
                      <h4 className="font-medium text-text-muted line-through">
                        {squad.name}
                      </h4>
                      <p className="text-xs text-text-dim mt-1">desativado</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 mt-2 text-xs text-warning">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>"{squad.reason}"</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Summary */}
      <div className="p-4 rounded-lg bg-bg-card border border-border-default">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-text-dim">Resumo: </span>
            <span className="text-sm font-medium text-text-primary">
              {selected.length} squads selecionados
            </span>
            {selected.length > 0 && (
              <>
                <span className="text-text-dim"> · </span>
                <span className="text-sm text-text-muted">
                  {selected.reduce((acc, s) => acc + s.agentCount, 0)} agentes
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
