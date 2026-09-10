import React, { useState, useEffect } from 'react';
import { Zap, Shield, Rocket, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui';
import { ProjectGrid, CreateProjectModal } from '../components/projects';

export const Portfolio: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setShowCreateModal(true);
    window.addEventListener('openNewProjectModal', handleOpenModal);
    return () => window.removeEventListener('openNewProjectModal', handleOpenModal);
  }, []);

  const stats = [
    { icon: <Rocket className="w-5 h-5" />, value: '3', label: 'Projetos Ativos', color: 'text-success' },
    { icon: <BarChart3 className="w-5 h-5" />, value: '87%', label: 'Média de Progresso', color: 'text-primary' },
    { icon: <Shield className="w-5 h-5" />, value: '12', label: 'Squads Disponíveis', color: 'text-secondary' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="gradient-text">AIOS Command Center</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-text-muted mb-8 leading-relaxed">
              Orquestre seus projetos com squads de agentes AI especializados.
              <br />
              Construa, escale e inovar com precisão.
            </p>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCreateModal(true)}
              icon={<Zap size={20} />}
              className="shadow-lg shadow-primary/30"
            >
              Criar Novo Projeto
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-lg mx-auto">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className={`inline-flex items-center justify-center mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-dim">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Seus Projetos</h2>
            <p className="text-sm text-text-muted mt-1">
              Gerencie e acompanhe o progresso dos seus projetos
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(true)}
            icon={<Zap size={16} />}
          >
            Novo Projeto
          </Button>
        </div>

        <ProjectGrid />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-border-default">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-12">
          Por que usar o AIOS Command Center?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '🎯',
              title: 'Squads Especializados',
              description: 'Acesse mais de 100 agentes especializados em diferentes áreas, desde desenvolvimento até marketing.',
            },
            {
              icon: '⚡',
              title: 'Execução Inteligente',
              description: 'Comandos automatizados e sugestões inteligentes para acelerar o desenvolvimento dos seus projetos.',
            },
            {
              icon: '📊',
              title: 'Métricas em Tempo Real',
              description: 'Acompanhe o progresso, logs e status de todos os agentes em tempo real.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-bg-card rounded-xl border border-border-default hover:border-border-hover transition-colors"
            >
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-text-dim">
            AIOS Command Center - Powered by advanced AI agents
          </p>
        </div>
      </footer>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
