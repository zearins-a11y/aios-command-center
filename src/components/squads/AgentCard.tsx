import { Avatar } from '../ui';
import { Agent, Command } from '../../types';

interface AgentCardProps {
  agent: Agent;
  onCommand?: (command: string, agentName: string) => void;
  compact?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onCommand, compact = false }) => {
  const handleCommand = (command: Command) => {
    if (onCommand) {
      onCommand(command.action, agent.name);
    }
  };

  const commands = compact ? agent.commands.slice(0, 3) : agent.commands;

  const getStatusColor = () => {
    switch (agent.status) {
      case 'available':
        return 'text-success';
      case 'working':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-text-dim';
    }
  };

  const getStatusLabel = () => {
    switch (agent.status) {
      case 'available':
        return 'Disponível';
      case 'working':
        return 'Trabalhando';
      case 'error':
        return 'Erro';
      default:
        return 'Offline';
    }
  };

  return (
    <div
      className={`bg-bg-card border border-border-default rounded-lg p-4 hover:border-border-hover transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 group ${
        agent.status === 'working' ? 'ring-1 ring-warning/30' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={agent.name} status={agent.status} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
            {agent.name}
          </h3>
          <p className="text-xs text-accent truncate">{agent.role}</p>
          <p className="text-xs text-text-dim truncate">{agent.specialty}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
          {agent.status === 'working' && (
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-warning rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-warning rounded-full animate-pulse delay-75" />
              <div className="w-1 h-3 bg-warning rounded-full animate-pulse delay-150" />
            </div>
          )}
        </div>
      </div>

      {/* Commands */}
      <div className="grid grid-cols-3 gap-2">
        {commands.map((command) => (
          <button
            key={command.id}
            onClick={() => handleCommand(command)}
            disabled={agent.status === 'offline' || agent.status === 'error'}
            className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 text-xs ${
              agent.status === 'offline' || agent.status === 'error'
                ? 'bg-bg-secondary/50 text-text-dim cursor-not-allowed'
                : 'bg-bg-secondary hover:bg-primary/20 text-text-muted hover:text-primary'
            }`}
          >
            <span className="text-base">{command.icon}</span>
            <span className="truncate">{command.label}</span>
          </button>
        ))}
      </div>

      {/* Show more button for compact mode */}
      {compact && agent.commands.length > 3 && (
        <button className="w-full mt-2 py-1 text-xs text-text-dim hover:text-primary transition-colors">
          +{agent.commands.length - 3} mais ações
        </button>
      )}
    </div>
  );
};

// Agent Grid for status overview
interface AgentGridProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

export const AgentGrid: React.FC<AgentGridProps> = ({ agents, onAgentClick }) => {
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'available':
        return 'bg-success';
      case 'working':
        return 'bg-warning';
      case 'error':
        return 'bg-error';
      default:
        return 'bg-text-dim';
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {agents.slice(0, 18).map((agent) => (
        <button
          key={agent.id}
          onClick={() => onAgentClick?.(agent)}
          className="group relative"
          title={`${agent.name} - ${agent.status}`}
        >
          <Avatar name={agent.name} size="sm" />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-bg-card ${getStatusColor(agent.status)} ${
              agent.status === 'available' || agent.status === 'working' ? 'animate-pulse' : ''
            }`}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-bg-card border border-border-default rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            <span className="text-text-primary">{agent.name}</span>
            <br />
            <span className="text-text-dim capitalize">{agent.status}</span>
          </div>
        </button>
      ))}
      {agents.length > 18 && (
        <div className="flex items-center justify-center text-xs text-text-dim">
          +{agents.length - 18}
        </div>
      )}
    </div>
  );
};

// Mini status grid (3x3)
interface StatusGridProps {
  agents: Agent[];
}

export const StatusGrid: React.FC<StatusGridProps> = ({ agents }) => {
  const statusCounts = {
    available: 0,
    working: 0,
    error: 0,
    offline: 0,
  };

  agents.forEach((agent) => {
    statusCounts[agent.status]++;
  });

  const getStatusColor = (status: keyof typeof statusCounts) => {
    switch (status) {
      case 'available':
        return 'bg-success';
      case 'working':
        return 'bg-warning';
      case 'error':
        return 'bg-error';
      default:
        return 'bg-text-dim';
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(statusCounts).map(([status, count]) => (
        <div key={status} className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getStatusColor(status as keyof typeof statusCounts)}`} />
          <span className="text-xs text-text-muted capitalize">{status}: {count}</span>
        </div>
      ))}
    </div>
  );
};
