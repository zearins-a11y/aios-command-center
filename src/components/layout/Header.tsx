import React, { useState } from 'react';
import { Settings, Bell, ChevronLeft, Zap, Menu, X } from 'lucide-react';
import { Button, Badge } from '../ui';
import { useStore } from '../../stores/useStore';
import { SyncButton } from '../SyncButton';
import { UserMenu } from '../UserMenu';

export const Header: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    currentProject,
    setCurrentProject,
    projects,
    toggleSidebar,
    sidebarCollapsed
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: 'QA Agent completou análise de testes', time: '2 min', type: 'success' },
    { id: 2, message: 'Novo agente disponível: UX Design Expert', time: '15 min', type: 'info' },
    { id: 3, message: 'DevOps reportou alerta de performance', time: '1h', type: 'warning' },
  ];

  return (
    <header className="h-16 bg-bg-secondary border-b border-border-default flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {currentPage === 'dashboard' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentProject(null);
              setCurrentPage('portfolio');
            }}
            icon={<ChevronLeft size={18} />}
          >
            Voltar
          </Button>
        )}

        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-bg-card rounded-md transition-colors"
        >
          {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              AIOS <span className="text-primary">Command</span> Center
            </h1>
            {currentProject && (
              <p className="text-xs text-text-dim">
                {projects.find(p => p.id === currentProject.id)?.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Center Section - Project Name (when on dashboard) */}
      {currentProject && (
        <div className="hidden md:flex items-center gap-3">
          <h2 className="text-xl font-semibold text-text-primary">{currentProject.name}</h2>
          <Badge
            variant={currentProject.status === 'active' ? 'success' : currentProject.status === 'paused' ? 'warning' : 'error'}
            dot
          >
            {currentProject.status === 'active' ? 'Ativo' : currentProject.status === 'paused' ? 'Pausado' : 'Erro'}
          </Badge>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </Button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-bg-card border border-border-default rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border-default">
                  <h3 className="font-semibold text-text-primary">Notificações</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="px-4 py-3 hover:bg-bg-secondary transition-colors cursor-pointer border-b border-border-default last:border-0"
                    >
                      <p className="text-sm text-text-primary">{notif.message}</p>
                      <p className="text-xs text-text-dim mt-1">{notif.time} atrás</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border-default bg-bg-secondary/50">
                  <button className="text-sm text-primary hover:text-primary-hover transition-colors">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sync Button */}
        <SyncButton compact showStatus={false} />

        {/* Settings */}
        <Button variant="ghost" size="sm">
          <Settings size={18} />
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};
