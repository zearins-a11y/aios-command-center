import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  ChevronRight,
  Users,
  Activity,
} from 'lucide-react';
import { Workspace, WORKSPACE_TYPE_COLORS, STATUS_COLORS } from '../../types/workspaces';
import { Badge } from '../ui';
import { getSquadById } from '../../data/squads';

interface WorkspaceCardProps {
  workspace: Workspace;
  onSelect: (workspace: Workspace) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onUnblock?: (id: string) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  workspace,
  onSelect,
  onPause,
  onResume,
  onUnblock,
}) => {
  const typeColor = WORKSPACE_TYPE_COLORS[workspace.type];
  const statusConfig = STATUS_COLORS[workspace.status];

  const activeAgents = workspace.agents.filter((a) => a.status === 'working').length;
  const idleAgents = workspace.agents.filter((a) => a.status === 'idle').length;
  const tasksActive = workspace.tasks.filter((t) => t.status === 'in_progress').length;

  const getStatusLabel = () => {
    switch (workspace.status) {
      case 'active':
        return 'Ativo';
      case 'paused':
        return 'Pausado';
      case 'blocked':
        return 'Bloqueado';
      case 'completed':
        return 'Concluído';
      case 'awaiting_approval':
        return 'Aguardando';
    }
  };

  const getActionButton = () => {
    switch (workspace.status) {
      case 'active':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPause?.(workspace.id);
            }}
            className="text-xs px-2 py-1 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors flex items-center gap-1"
          >
            <Pause className="w-3 h-3" />
            Pausar
          </button>
        );
      case 'paused':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResume?.(workspace.id);
            }}
            className="text-xs px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            Retomar
          </button>
        );
      case 'blocked':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnblock?.(workspace.id);
            }}
            className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Resolver
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(workspace)}
      className="bg-bg-card border border-border-default rounded-lg overflow-hidden cursor-pointer hover:border-border-hover transition-all duration-200 group"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: typeColor,
      }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text-primary text-sm">{workspace.name}</h3>
          </div>
          <ChevronRight
            size={16}
            className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant={
              workspace.status === 'active'
                ? 'success'
                : workspace.status === 'paused'
                ? 'warning'
                : workspace.status === 'blocked'
                ? 'error'
                : workspace.status === 'completed'
                ? 'info'
                : 'info'
            }
            size="sm"
          >
            <span className={`${statusConfig.dot} w-2 h-2 rounded-full mr-1`} />
            {getStatusLabel()}
          </Badge>
          {workspace.blockedReason && (
            <span className="text-xs text-text-dim truncate max-w-[120px]" title={workspace.blockedReason}>
              {workspace.blockedReason}
            </span>
          )}
        </div>

        {/* Squads */}
        <div className="flex items-center gap-1 mb-3">
          {workspace.squads.slice(0, 3).map((squadId) => {
            const squad = getSquadById(squadId);
            return squad ? (
              <span key={squadId} className="text-xs">
                {squad.icon}
              </span>
            ) : null;
          })}
          {workspace.squads.length > 3 && (
            <span className="text-xs text-text-dim">+{workspace.squads.length - 3}</span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-dim">Progresso</span>
            <span className="text-text-muted font-medium">{workspace.progress}%</span>
          </div>
          <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${workspace.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: typeColor }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-text-dim">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {tasksActive} {tasksActive === 1 ? 'ativa' : 'ativas'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {activeAgents + idleAgents} agentes
            </span>
          </div>
          {getActionButton()}
        </div>
      </div>
    </motion.div>
  );
};
