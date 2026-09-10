import React, { useState } from 'react';
import { Folder, Users, Zap } from 'lucide-react';
import { Modal, Button, Input, Textarea } from '../ui';
import { useStore } from '../../stores/useStore';
import { allSquads } from '../../data/squads';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const handleSubmit = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createProject(name.trim(), description.trim(), selectedSquads);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedSquads([]);
    setErrors({});
    onClose();
  };

  const toggleSquad = (squadId: string) => {
    setSelectedSquads((prev) =>
      prev.includes(squadId)
        ? prev.filter((id) => id !== squadId)
        : [...prev, squadId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Criar Novo Projeto" size="lg">
      <div className="space-y-6">
        {/* Name */}
        <Input
          label="Nome do Projeto"
          placeholder="Ex: Sistema de Gestão"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          icon={<Folder size={16} />}
        />

        {/* Description */}
        <Textarea
          label="Descrição"
          placeholder="Descreva o objetivo e escopo do projeto..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          error={errors.description}
          rows={3}
        />

        {/* Squads Selection */}
        <div>
          <label className="text-sm font-medium text-text-muted flex items-center gap-2 mb-3">
            <Users size={14} />
            Squads Iniciais
            <span className="text-xs text-text-dim">(opcional)</span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
            {allSquads
              .filter((s) => s.id !== 'clevel' && s.id !== 'advisory')
              .map((squad) => (
                <button
                  key={squad.id}
                  onClick={() => toggleSquad(squad.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all text-sm ${
                    selectedSquads.includes(squad.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border-default bg-bg-secondary text-text-muted hover:border-border-hover hover:text-text-primary'
                  }`}
                >
                  <span className="text-base">{squad.icon}</span>
                  <span className="flex-1 text-left truncate">{squad.name}</span>
                  {selectedSquads.includes(squad.id) && (
                    <span className="text-xs">✓</span>
                  )}
                </button>
              ))}
          </div>
          {selectedSquads.length > 0 && (
            <p className="text-xs text-text-dim mt-2">
              {selectedSquads.length} squad{selectedSquads.length > 1 ? 's' : ''} selecionado{selectedSquads.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Quick Start Templates */}
        <div>
          <label className="text-sm font-medium text-text-muted flex items-center gap-2 mb-3">
            <Zap size={14} />
            Início Rápido
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'E-commerce', squads: ['aios', 'design', 'copy', 'data'] },
              { label: 'SaaS App', squads: ['aios', 'design', 'data', 'hormozi'] },
            ].map((template) => (
              <button
                key={template.label}
                onClick={() => setSelectedSquads(template.squads)}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-border-default bg-bg-secondary hover:bg-bg-card transition-colors text-xs"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-8">
        <Button variant="ghost" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Criar Projeto
        </Button>
      </div>
    </Modal>
  );
};
