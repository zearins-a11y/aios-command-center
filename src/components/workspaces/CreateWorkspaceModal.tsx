import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button, Modal } from '../ui';
import { WorkspaceType, WORKSPACE_TYPE_COLORS } from '../../types/workspaces';
import { allSquads } from '../../data/squads';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    type: WorkspaceType;
    squads: string[];
  }) => void;
  projectId: string;
}

const WORKSPACE_TYPES: { value: WorkspaceType; label: string; icon: string }[] = [
  { value: 'backend', label: 'Backend/API', icon: '🔧' },
  { value: 'frontend', label: 'Frontend', icon: '🎨' },
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'data', label: 'Data/Analytics', icon: '📊' },
  { value: 'design', label: 'Design', icon: '🎯' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'other', label: 'Outro', icon: '📦' },
];

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  projectId: _projectId,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkspaceType>('backend');
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedSquads.length === 0) return;

    onCreate({ name: name.trim(), type, squads: selectedSquads });
    setName('');
    setType('backend');
    setSelectedSquads([]);
    onClose();
  };

  const toggleSquad = (squadId: string) => {
    setSelectedSquads((prev) =>
      prev.includes(squadId)
        ? prev.filter((s) => s !== squadId)
        : [...prev, squadId]
    );
  };

  const availableSquads = allSquads.filter(
    (s) => s.id !== 'clevel' && s.id !== 'advisory'
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Workspace"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!name.trim() || selectedSquads.length === 0}
            icon={<Plus className="w-4 h-4" />}
          >
            Criar Workspace
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Nome do Workspace
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Backend/API"
            className="w-full px-3 py-2 bg-bg-secondary border border-border-default rounded-lg text-text-primary placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tipo do Workspace
          </label>
          <div className="grid grid-cols-2 gap-2">
            {WORKSPACE_TYPES.map((wt) => (
              <button
                key={wt.value}
                type="button"
                onClick={() => setType(wt.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                  type === wt.value
                    ? 'border-primary bg-primary/10 text-text-primary'
                    : 'border-border-default bg-bg-secondary text-text-muted hover:border-border-hover'
                }`}
              >
                <span>{wt.icon}</span>
                <span>{wt.label}</span>
                {type === wt.value && (
                  <motion.div
                    layoutId="type-indicator"
                    className="ml-auto w-2 h-2 rounded-full bg-primary"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Squads */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Squads que atuam neste workspace
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {availableSquads.map((squad) => (
              <button
                key={squad.id}
                type="button"
                onClick={() => toggleSquad(squad.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-sm ${
                  selectedSquads.includes(squad.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border-default bg-bg-secondary hover:border-border-hover'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedSquads.includes(squad.id)
                      ? 'border-primary bg-primary'
                      : 'border-border-default'
                  }`}
                  style={{
                    borderColor: selectedSquads.includes(squad.id) ? WORKSPACE_TYPE_COLORS[squad.id as WorkspaceType] || '#6366f1' : undefined,
                    backgroundColor: selectedSquads.includes(squad.id) ? (WORKSPACE_TYPE_COLORS[squad.id as WorkspaceType] || '#6366f1') : undefined,
                  }}
                >
                  {selectedSquads.includes(squad.id) && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-lg">{squad.icon}</span>
                <div className="flex-1 text-left">
                  <span className="text-text-primary">{squad.name}</span>
                  <span className="text-text-dim text-xs ml-2">
                    {squad.agents.length} agentes
                  </span>
                </div>
              </button>
            ))}
          </div>
          {selectedSquads.length === 0 && (
            <p className="text-xs text-warning mt-2">
              Selecione pelo menos um squad
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};
