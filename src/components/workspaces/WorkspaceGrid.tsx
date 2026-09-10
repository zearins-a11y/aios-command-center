import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Workspace } from '../../types/workspaces';
import { WorkspaceCard } from './WorkspaceCard';
import { Button } from '../ui';

interface WorkspaceGridProps {
  workspaces: Workspace[];
  onSelectWorkspace: (workspace: Workspace) => void;
  onPauseWorkspace: (id: string) => void;
  onResumeWorkspace: (id: string) => void;
  onUnblockWorkspace: (id: string) => void;
  onCreateWorkspace?: () => void;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  workspaces,
  onSelectWorkspace,
  onPauseWorkspace,
  onResumeWorkspace,
  onUnblockWorkspace,
  onCreateWorkspace,
}) => {
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-text-dim" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Nenhum workspace</h3>
        <p className="text-sm text-text-dim mb-4 max-w-xs">
          Crie workspaces para organizar o trabalho em diferentes áreas do projeto
        </p>
        {onCreateWorkspace && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onCreateWorkspace}
          >
            Criar Workspace
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-dim">
          {workspaces.length} {workspaces.length === 1 ? 'Workspace' : 'Workspaces'} Ativos
        </h3>
        {onCreateWorkspace && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onCreateWorkspace}
          >
            Novo
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {workspaces.map((workspace, index) => (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <WorkspaceCard
                workspace={workspace}
                onSelect={onSelectWorkspace}
                onPause={onPauseWorkspace}
                onResume={onResumeWorkspace}
                onUnblock={onUnblockWorkspace}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
