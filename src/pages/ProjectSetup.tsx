import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { Button, Modal } from '../components/ui';
import { SquadSelector } from '../components/projects/SquadSelector';
import { useWorkspacesStore } from '../stores/useWorkspacesStore';
import { Project } from '../types';

interface ProjectSetupProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirm: (selectedSquads: string[]) => void;
}

export const ProjectSetup: React.FC<ProjectSetupProps> = ({
  isOpen,
  onClose,
  project,
  onConfirm,
}) => {
  const {
    squadSuggestions,
    initializeSuggestions,
    toggleSquadSelection,
  } = useWorkspacesStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setIsAnalyzing(true);
      setAnalysisComplete(false);

      // Simulate analysis delay
      const timer = setTimeout(() => {
        initializeSuggestions(project.name, project.description);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, project, initializeSuggestions]);

  const selectedCount = squadSuggestions.filter((s) => s.status === 'selected').length;
  const selectedAgents = squadSuggestions
    .filter((s) => s.status === 'selected')
    .reduce((acc, s) => acc + s.agentCount, 0);

  const handleConfirm = () => {
    const selectedSquadIds = squadSuggestions
      .filter((s) => s.status === 'selected')
      .map((s) => s.squadId);
    onConfirm(selectedSquadIds);
    onClose();
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      showClose={false}
    >
      <div className="-mt-2 -mx-6 -mb-4">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border-default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  CONFIGURACAO DE SQUADS
                </h2>
                <p className="text-sm text-text-dim">
                  Projeto: <span className="text-text-primary font-medium">{project.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-card transition-colors text-text-dim hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Analysis Section */}
          <div className="mb-6 p-4 rounded-lg bg-bg-card border border-border-default">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📋</span>
              <h3 className="text-sm font-semibold text-text-primary">Analise Automatica</h3>
            </div>
            <p className="text-sm text-text-muted mb-3">
              Baseado na descricao "{project.description.substring(0, 60)}..." detectamos que
              voce precisa de:
            </p>

            {isAnalyzing ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-sm text-text-muted">
                  Analisando projeto e gerando sugestoes...
                </span>
              </div>
            ) : analysisComplete ? (
              <div className="flex items-center gap-2 p-2 rounded bg-success/10 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Analise concluida com sucesso!</span>
              </div>
            ) : null}
          </div>

          {/* Squad Suggestions */}
          {analysisComplete && squadSuggestions.length > 0 ? (
            <SquadSelector
              suggestions={squadSuggestions}
              onToggleSquad={toggleSquadSelection}
            />
          ) : !isAnalyzing ? (
            <div className="text-center py-8">
              <p className="text-text-dim">Nenhuma sugestao disponivel</p>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-bg-secondary border-t border-border-default">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-dim">
              {selectedCount > 0 ? (
                <>
                  <span className="font-medium text-text-primary">{selectedCount} squads</span>
                  {' · '}
                  <span>{selectedAgents} agentes</span>
                  {' · '}
                  <span className="text-warning">Estimativa 4-6 semanas</span>
                </>
              ) : (
                <span>Selecione os squads que atuarao no projeto</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onClose}>
                Pular (depois configuro)
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={selectedCount === 0}
                icon={<CheckCircle className="w-4 h-4" />}
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                Confirmar Squads
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
