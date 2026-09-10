import React from 'react';
import { Plus } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { useStore } from '../../stores/useStore';

export const ProjectGrid: React.FC = () => {
  const { projects } = useStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}

      {/* New Project Card */}
      <div
        className="border-2 border-dashed border-border-default rounded-lg p-8 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group min-h-[280px]"
        onClick={() => {
          // This will be handled by the parent component to show the modal
          const event = new CustomEvent('openNewProjectModal');
          window.dispatchEvent(event);
        }}
      >
        <div className="w-16 h-16 rounded-full bg-bg-secondary group-hover:bg-primary/20 flex items-center justify-center transition-colors">
          <Plus size={32} className="text-text-dim group-hover:text-primary transition-colors" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
            Novo Projeto
          </h3>
          <p className="text-sm text-text-dim mt-1">
            Crie um novo projeto com squads AI
          </p>
        </div>
      </div>
    </div>
  );
};
