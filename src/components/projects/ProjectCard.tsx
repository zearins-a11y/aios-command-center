import React from 'react';
import { Clock, MoreVertical, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { Project } from '../../types';
import { useStore } from '../../stores/useStore';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { setCurrentProject, deleteProject } = useStore();
  const [showMenu, setShowMenu] = React.useState(false);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const getStatusIcon = () => {
    switch (project.status) {
      case 'active':
        return '🟢';
      case 'paused':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusVariant = () => {
    switch (project.status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'gray';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
      deleteProject(project.id);
    }
    setShowMenu(false);
  };

  return (
    <Card
      className="group relative overflow-hidden"
      interactive
      onClick={() => setCurrentProject(project)}
    >
      {/* Gradient accent on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getStatusIcon()}</span>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                {project.name}
              </h3>
            </div>
            <Badge variant={getStatusVariant()} size="sm" dot>
              {project.status === 'active' ? 'Ativo' : project.status === 'paused' ? 'Pausado' : 'Erro'}
            </Badge>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors text-text-dim hover:text-text-muted"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-bg-card border border-border-default rounded-lg shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:bg-bg-secondary transition-colors"
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                  >
                    <Trash2 size={14} />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-text-muted mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-dim">Progresso</span>
            <span className="text-text-muted font-medium">{project.progress}%</span>
          </div>
          <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-default">
          <div className="flex items-center gap-1.5 text-xs text-text-dim">
            <Clock size={12} />
            <span>{formatRelativeTime(project.lastActivity)}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.squads.slice(0, 3).map((squadId) => (
                <div
                  key={squadId}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-bg-card flex items-center justify-center text-xs"
                  title={squadId}
                >
                  {squadId[0].toUpperCase()}
                </div>
              ))}
              {project.squads.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-bg-secondary border-2 border-bg-card flex items-center justify-center text-xs text-text-dim">
                  +{project.squads.length - 3}
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentProject(project);
              }}
              icon={<ExternalLink size={12} />}
            >
              Abrir
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
