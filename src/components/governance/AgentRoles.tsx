import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  PenTool,
  Palette,
  Shield,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AgentRoleData, AgentRole } from '../../types/governance';
import { StrikeBadge } from './StrikePanel';

interface AgentRolesProps {
  agents: AgentRoleData[];
  onAgentClick?: (id: string) => void;
}

const agentIcons: Record<string, React.ReactNode> = {
  strategy: <Brain size={20} />,
  copywriter: <PenTool size={20} />,
  studio: <Palette size={20} />,
  guardian: <Shield size={20} />,
  operator: <Settings size={20} />,
};

const statusColors = {
  idle: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    label: 'IDLE',
  },
  working: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    label: 'WORKING',
  },
  blocked: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    label: 'BLOCKED',
  },
};

export const AgentRoles: React.FC<AgentRolesProps> = ({ agents, onAgentClick }) => {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedAgent(expandedAgent === id ? null : id);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {agents.map((agent, index) => {
        const status = statusColors[agent.status];
        const icon = agentIcons[agent.id] || <Brain size={20} />;
        const isExpanded = expandedAgent === agent.id;
        const isWorking = agent.status === 'working';

        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`
              relative bg-bg-card border rounded-xl p-4 cursor-pointer
              transition-all duration-200
              hover:border-border-hover hover:bg-bg-card-hover
              ${status.border}
            `}
            onClick={() => {
              toggleExpand(agent.id);
              onAgentClick?.(agent.id);
            }}
          >
            {/* Working indicator */}
            {isWorking && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-blue-400/50"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(59, 130, 246, 0.3)',
                    '0 0 20px rgba(59, 130, 246, 0.5)',
                    '0 0 10px rgba(59, 130, 246, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Icon */}
            <div className={`mb-3 ${status.text}`}>{icon}</div>

            {/* Name */}
            <h4 className="text-sm font-semibold text-text-primary mb-1">
              {agent.name}
            </h4>

            {/* Status badge */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${status.bg} ${status.text}`}>
                {isWorking && (
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                {status.label}
              </div>

              {/* Strike Badge */}
              <StrikeBadge
                agentId={agent.id as AgentRole}
                agentName={agent.name}
                size="sm"
                showCount={true}
              />
            </div>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-3 text-xs text-text-dim">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-text-muted">{agent.activeTasks}</span>
                <span>ativas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-text-muted">{agent.queueTasks}</span>
                <span>fila</span>
              </div>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-border-default overflow-hidden"
                >
                  <p className="text-xs text-text-dim mb-2">{agent.description}</p>
                  <div className="flex items-center gap-1 text-xs text-text-dim">
                    {isExpanded ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                    <span>Detalhes</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};
