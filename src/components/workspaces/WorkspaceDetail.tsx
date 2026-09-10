import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Lock,
  CheckCircle,
  Activity,
  Plus,
  Settings,
  Trash2,
  Check,
  Circle,
  Loader,
} from 'lucide-react';
import { Workspace, WORKSPACE_TYPE_COLORS, TaskStatus } from '../../types/workspaces';
import { Badge, Button } from '../ui';
import { getSquadById, getAgentById } from '../../data/squads';

interface WorkspaceDetailProps {
  workspace: Workspace;
  onClose: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onUnblock?: () => void;
  onAddTask?: () => void;
  onUpdateTask?: (taskId: string, status: TaskStatus) => void;
  onDeleteTask?: (taskId: string) => void;
  onDelete?: () => void;
}

export const WorkspaceDetail: React.FC<WorkspaceDetailProps> = ({
  workspace,
  onClose,
  onPause,
  onResume,
  onUnblock,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDelete,
}) => {
  const typeColor = WORKSPACE_TYPE_COLORS[workspace.type];

  const tasksDone = workspace.tasks.filter((t) => t.status === 'done').length;
  const tasksTotal = workspace.tasks.length;
  const workingAgents = workspace.agents.filter((a) => a.status === 'working');

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTaskIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <Check className="w-4 h-4 text-success" />;
      case 'in_progress':
        return <Loader className="w-4 h-4 text-warning animate-spin" />;
      case 'pending':
        return <Circle className="w-4 h-4 text-text-dim" />;
    }
  };

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

  const getStatusActions = () => {
    switch (workspace.status) {
      case 'active':
        return (
          <>
            <Button variant="ghost" size="sm" icon={<Pause className="w-4 h-4" />} onClick={onPause}>
              Pausar
            </Button>
          </>
        );
      case 'paused':
        return (
          <>
            <Button variant="ghost" size="sm" icon={<Play className="w-4 h-4" />} onClick={onResume}>
              Retomar
            </Button>
          </>
        );
      case 'blocked':
        return (
          <>
            <Button variant="ghost" size="sm" icon={<Lock className="w-4 h-4" />} onClick={onUnblock}>
              Desbloquear
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-bg-secondary border-l border-border-default h-full flex flex-col"
    >
      {/* Header */}
      <div
        className="p-4 border-b border-border-default"
        style={{ borderLeftWidth: 3, borderLeftColor: typeColor }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              {workspace.name}
            </h2>
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
              className="mt-1"
            >
              {getStatusLabel()}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-bg-card transition-colors text-text-dim hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Squads */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-text-dim">Squads:</span>
          {workspace.squads.map((squadId) => {
            const squad = getSquadById(squadId);
            return squad ? (
              <span key={squadId} className="text-xs bg-bg-card px-2 py-1 rounded">
                {squad.icon} {squad.name}
              </span>
            ) : null;
          })}
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-dim">Progresso</span>
            <span className="text-text-muted font-medium">
              {tasksDone}/{tasksTotal} tasks · {workspace.progress}%
            </span>
          </div>
          <div className="h-2 bg-bg-card rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${workspace.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: typeColor }}
            />
          </div>
        </div>

        {/* Blocked Reason */}
        {workspace.blockedReason && (
          <div className="p-2 rounded bg-error/10 border border-error/30 text-xs text-error mb-3">
            <Lock className="w-3 h-3 inline mr-1" />
            {workspace.blockedReason}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {getStatusActions()}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />}>
            Configurar
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onDelete}
          >
            Encerrar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Working Agents */}
        {workingAgents.length > 0 && (
          <div className="p-4 border-b border-border-default">
            <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Agentes trabalhando agora
            </h3>
            <div className="space-y-2">
              {workingAgents.map((wa) => {
                const agent = getAgentById(wa.agentId);
                if (!agent) return null;
                return (
                  <div key={wa.agentId} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-text-primary">{agent.name}</span>
                    <span className="text-text-dim">({agent.specialty})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tasks */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Tasks do Workspace
            </h3>
            {onAddTask && (
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus className="w-3 h-3" />}
                onClick={onAddTask}
              >
                Nova
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {workspace.tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    task.status === 'done'
                      ? 'bg-success/5'
                      : task.status === 'in_progress'
                      ? 'bg-warning/5'
                      : 'bg-bg-card'
                  }`}
                >
                  <button
                    onClick={() => {
                      if (onUpdateTask) {
                        const nextStatus: Record<TaskStatus, TaskStatus> = {
                          pending: 'in_progress',
                          in_progress: 'done',
                          done: 'pending',
                        };
                        onUpdateTask(task.id, nextStatus[task.status]);
                      }
                    }}
                    className="flex-shrink-0"
                  >
                    {getTaskIcon(task.status)}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      task.status === 'done' ? 'text-text-dim line-through' : 'text-text-primary'
                    }`}
                  >
                    {task.title}
                  </span>
                  {onDeleteTask && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-error transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {workspace.tasks.length === 0 && (
              <p className="text-sm text-text-dim text-center py-4">Nenhuma task ainda</p>
            )}
          </div>
        </div>

        {/* Logs */}
        <div className="p-4 border-t border-border-default">
          <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3">
            Logs recentes
          </h3>
          <div className="space-y-2">
            {workspace.logs.slice(0, 10).map((log) => {
              const logColors = {
                info: 'text-blue-400',
                success: 'text-success',
                warning: 'text-warning',
                error: 'text-error',
              };
              return (
                <div key={log.id} className="flex items-start gap-2 text-xs">
                  <span className="text-text-dim flex-shrink-0">{formatTime(log.timestamp)}</span>
                  <span className={`${logColors[log.type]} font-medium`}>
                    {log.type === 'success' && '✓ '}
                    {log.agent}:
                  </span>
                  <span className="text-text-muted">{log.message}</span>
                </div>
              );
            })}
            {workspace.logs.length === 0 && (
              <p className="text-sm text-text-dim text-center py-4">Nenhum log ainda</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
