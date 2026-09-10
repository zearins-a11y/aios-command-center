import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Users } from 'lucide-react';
import { Badge } from '../ui';
import { Squad } from '../../types';
import { AgentCard } from './AgentCard';
import { useStore } from '../../stores/useStore';

interface SquadListProps {
  squads: Squad[];
  onAgentCommand?: (command: string, agentName: string) => void;
}

export const SquadList: React.FC<SquadListProps> = ({ squads, onAgentCommand }) => {
  const { expandedSquads, toggleSquad } = useStore();
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null);

  const handleSquadToggle = (squadId: string) => {
    toggleSquad(squadId);
    setSelectedSquad(squadId === selectedSquad ? null : squadId);
  };

  return (
    <div className="space-y-2">
      {squads.map((squad) => {
        const isExpanded = expandedSquads.includes(squad.id);
        const hasActiveAgents = squad.agents.some(
          (a) => a.status === 'available' || a.status === 'working'
        );

        return (
          <div key={squad.id} className="border border-border-default rounded-lg overflow-hidden">
            {/* Squad Header */}
            <button
              onClick={() => handleSquadToggle(squad.id)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-bg-card hover:bg-bg-card-hover transition-colors"
            >
              <span className="text-xl">{squad.icon}</span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">{squad.name}</h3>
                  {hasActiveAgents && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-dim">{squad.description}</p>
              </div>
              <Badge variant="gray" size="sm">
                <Users size={10} />
                {squad.agents.length}
              </Badge>
              {isExpanded ? (
                <ChevronDown size={16} className="text-text-dim" />
              ) : (
                <ChevronRight size={16} className="text-text-dim" />
              )}
            </button>

            {/* Agents Grid */}
            {isExpanded && (
              <div className="p-4 bg-bg-secondary/50 border-t border-border-default">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {squad.agents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onCommand={onAgentCommand}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
