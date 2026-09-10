import React, { useMemo, useState } from 'react';
import { LayoutGrid, Users, Activity, TrendingUp, Clock, Target, ChevronRight, History, Zap, Layers } from 'lucide-react';
import { Header, Sidebar, Console } from '../components/layout';
import { AgentCard, AgentGrid, StatusGrid } from '../components/squads';
import { Card, Badge, Button } from '../components/ui';
import { BuildHistory } from '../components/BuildHistory';
import { WorkspaceGrid, WorkspaceDetail, CreateWorkspaceModal } from '../components/workspaces';
import { ProjectSetup } from './ProjectSetup';
import { useStore } from '../stores/useStore';
import { useWorkspacesStore } from '../stores/useWorkspacesStore';
import { allSquads, getSquadsForProject } from '../data/squads';
import { Workspace, TaskStatus, WorkspaceType } from '../types/workspaces';

export const ProjectDashboard: React.FC = () => {
  const {
    currentProject,
    addLog,
    addToast,
    logs,
    logFilter,
    setLogFilter,
    clearLogs,
    updateProject,
  } = useStore();

  const {
    workspaces,
    getWorkspacesByProject,
    setSelectedWorkspace,
    selectedWorkspaceId,
    pauseWorkspace,
    resumeWorkspace,
    unblockWorkspace,
    addWorkspace,
    addTask,
    updateTask,
    deleteTask,
    deleteWorkspace,
  } = useWorkspacesStore();

  const [rightPanelTab, setRightPanelTab] = useState<'build-history' | 'console'>('build-history');
  const [showSetup, setShowSetup] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showWorkspacesPanel, setShowWorkspacesPanel] = useState(false);

  // Get workspaces for current project
  const projectWorkspaces = useMemo(() => {
    if (!currentProject) return [];
    return getWorkspacesByProject(currentProject.id);
  }, [currentProject, getWorkspacesByProject, workspaces]);

  // Get selected workspace
  const selectedWorkspace = useMemo(() => {
    return projectWorkspaces.find(w => w.id === selectedWorkspaceId) || null;
  }, [projectWorkspaces, selectedWorkspaceId]);

  // Get squads for current project
  const projectSquads = useMemo(() => {
    if (!currentProject) return allSquads.filter(s => s.id !== 'clevel' && s.id !== 'advisory');
    return getSquadsForProject(currentProject.squads);
  }, [currentProject]);

  // Get all agents from project squads
  const projectAgents = useMemo(() => {
    return projectSquads.flatMap(s => s.agents);
  }, [projectSquads]);

  // Handle agent command
  const handleAgentCommand = (command: string, agentName: string) => {
    const messages: Record<string, string> = {
      build: `Iniciando build para ${agentName}...`,
      analyze: `Analisando dados com ${agentName}...`,
      suggest: `${agentName} gerando sugestoes...`,
      validate: `Validando com ${agentName}...`,
      create: `${agentName} criando novo item...`,
      sync: `Sincronizando com ${agentName}...`,
    };

    addLog({
      type: 'info',
      source: agentName,
      message: messages[command] || `Executando comando ${command}...`,
    });

    setTimeout(() => {
      addLog({
        type: 'success',
        source: agentName,
        message: `Comando ${command} concluido com sucesso!`,
      });
      addToast('success', `${command} executado por ${agentName}`);
    }, 2000);
  };

  // Workspace handlers
  const handleSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace.id);
    setShowWorkspacesPanel(true);
  };

  const handlePauseWorkspace = (id: string) => {
    pauseWorkspace(id);
    addToast('info', 'Workspace pausado');
    addLog({ type: 'warning', source: 'System', message: 'Workspace pausado pelo operador' });
  };

  const handleResumeWorkspace = (id: string) => {
    resumeWorkspace(id);
    addToast('success', 'Workspace retomado');
    addLog({ type: 'success', source: 'System', message: 'Workspace retomado' });
  };

  const handleUnblockWorkspace = (id: string) => {
    unblockWorkspace(id);
    addToast('success', 'Workspace desbloqueado');
    addLog({ type: 'success', source: 'System', message: 'Workspace desbloqueado' });
  };

  const handleCreateWorkspace = (data: { name: string; type: WorkspaceType; squads: string[] }) => {
    if (!currentProject) return;

    addWorkspace({
      projectId: currentProject.id,
      name: data.name,
      type: data.type,
      status: 'active',
      progress: 0,
      squads: data.squads,
      agents: [],
      tasks: [],
      logs: [],
    });

    addToast('success', `Workspace "${data.name}" criado!`);
    addLog({ type: 'success', source: 'System', message: `Novo workspace criado: ${data.name}` });
    setShowCreateWorkspace(false);
  };

  const handleUpdateTask = (taskId: string, status: TaskStatus) => {
    if (!selectedWorkspaceId) return;
    updateTask(selectedWorkspaceId, taskId, { status });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedWorkspaceId) return;
    deleteTask(selectedWorkspaceId, taskId);
  };

  const handleDeleteWorkspace = () => {
    if (!selectedWorkspaceId || !selectedWorkspace) return;
    const name = selectedWorkspace.name;
    deleteWorkspace(selectedWorkspaceId);
    setSelectedWorkspace(null);
    setShowWorkspacesPanel(false);
    addToast('info', `Workspace "${name}" encerrado`);
    addLog({ type: 'warning', source: 'System', message: `Workspace "${name}" encerrado` });
  };

  const handleAddTask = () => {
    if (!selectedWorkspaceId) return;
    addTask(selectedWorkspaceId, {
      title: 'Nova task',
      status: 'pending',
    });
  };

  const handleSquadSetupConfirm = (selectedSquads: string[]) => {
    if (!currentProject) return;
    updateProject(currentProject.id, { squads: selectedSquads });
    addToast('success', 'Squads configurados com sucesso!');
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-muted">Nenhum projeto selecionado</p>
      </div>
    );
  }

  // Stats
  const stats = [
    {
      icon: <Activity className="w-5 h-5" />,
      label: 'Agentes Ativos',
      value: projectAgents.filter(a => a.status === 'available' || a.status === 'working').length,
      total: projectAgents.length,
      color: 'text-success',
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Progresso',
      value: `${currentProject.progress}%`,
      color: 'text-primary',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Ultima Atividade',
      value: 'Agora',
      color: 'text-accent',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Squads',
      value: projectSquads.length,
      color: 'text-secondary',
    },
  ];

  // Console log type styles
  const logTypeStyles: Record<string, { bg: string; border: string; dot: string }> = {
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    if (logFilter === 'build') return log.type === 'info';
    if (logFilter === 'error') return log.type === 'error';
    if (logFilter === 'success') return log.type === 'success';
    return true;
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-screen bg-bg-primary flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Stats Bar */}
          <div className="bg-bg-secondary border-b border-border-default px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <Card key={idx} className="p-4 bg-bg-card/50" hover={false}>
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color}`}>{stat.icon}</div>
                    <div>
                      <p className="text-xs text-text-dim">{stat.label}</p>
                      <p className="text-lg font-bold text-text-primary">
                        {stat.value}
                        {stat.total && (
                          <span className="text-sm text-text-dim">/{stat.total}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Workspaces Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <Layers size={18} />
                  Workspaces
                  {projectWorkspaces.length > 0 && (
                    <Badge variant="info" size="sm">
                      {projectWorkspaces.length} ativos
                    </Badge>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSetup(true)}
                  >
                    Configurar Squads
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowCreateWorkspace(true)}
                  >
                    + Novo Workspace
                  </Button>
                </div>
              </div>

              <WorkspaceGrid
                workspaces={projectWorkspaces}
                onSelectWorkspace={handleSelectWorkspace}
                onPauseWorkspace={handlePauseWorkspace}
                onResumeWorkspace={handleResumeWorkspace}
                onUnblockWorkspace={handleUnblockWorkspace}
              />
            </section>

            {/* Agent Cards Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <LayoutGrid size={18} />
                  Agentes do Projeto
                </h2>
                <div className="flex items-center gap-2">
                  <StatusGrid agents={projectAgents} />
                </div>
              </div>

              {/* Featured Agents */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-dim mb-3">Destaque</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectAgents.slice(0, 6).map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onCommand={handleAgentCommand}
                    />
                  ))}
                </div>
              </div>

              {/* Agent Grid */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-text-dim mb-3 flex items-center gap-2">
                  <Users size={14} />
                  Visao Geral ({projectAgents.length} agentes)
                </h3>
                <Card className="p-4 bg-bg-card/50" hover={false}>
                  <AgentGrid agents={projectAgents} />
                </Card>
              </div>
            </section>

            {/* Squads Section */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                <TrendingUp size={18} />
                Squads Ativos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {projectSquads.slice(0, 8).map((squad) => {
                  const activeCount = squad.agents.filter(
                    a => a.status === 'available' || a.status === 'working'
                  ).length;
                  return (
                    <Card key={squad.id} className="p-4 bg-bg-card/50" hover>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{squad.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {squad.name}
                          </p>
                          <p className="text-xs text-text-dim">
                            {activeCount}/{squad.agents.length} ativos
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-text-dim" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Doniq Special Section */}
            {currentProject.id === 'doniq' && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <span className="text-2xl">📦</span>
                  Modulos Doniq
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'Cadastros', icon: '📋', items: ['Produtos', 'Clientes', 'Fornecedores'] },
                    { name: 'Movimentacoes', icon: '🔄', items: ['Entradas', 'Saidas'] },
                    { name: 'Utilitarios', icon: '🛠️', items: ['Backup', 'Restore'] },
                    { name: 'Relatorios', icon: '📊', items: ['Estoque', 'Vendas', 'Compras', 'Lucros'] },
                  ].map((module, idx) => (
                    <Card key={idx} className="p-4 bg-bg-card/50" hover>
                      <div className="text-center">
                        <span className="text-3xl mb-2 block">{module.icon}</span>
                        <p className="text-sm font-semibold text-text-primary mb-1">{module.name}</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {module.items.map((item, i) => (
                            <Badge key={i} variant="gray" size="sm">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Console - Compact Version */}
          <div className="border-t border-border-default">
            <Console />
          </div>
        </main>

        {/* Right Panel - Workspace Detail or Build History */}
        <aside className="w-[440px] border-l border-slate-700/50 h-full overflow-hidden flex flex-col bg-slate-900/30">
          {showWorkspacesPanel && selectedWorkspace ? (
            <WorkspaceDetail
              workspace={selectedWorkspace}
              onClose={() => {
                setShowWorkspacesPanel(false);
                setSelectedWorkspace(null);
              }}
              onPause={() => handlePauseWorkspace(selectedWorkspace.id)}
              onResume={() => handleResumeWorkspace(selectedWorkspace.id)}
              onUnblock={() => handleUnblockWorkspace(selectedWorkspace.id)}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onDelete={handleDeleteWorkspace}
            />
          ) : (
            <>
              {/* Tab Switcher */}
              <div className="p-3 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setRightPanelTab('build-history')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      rightPanelTab === 'build-history'
                        ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    Build History
                  </button>
                  <button
                    onClick={() => setRightPanelTab('console')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      rightPanelTab === 'console'
                        ? 'bg-blue-500/20 text-blue-400 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Console
                  </button>
                </div>
              </div>

              {/* Content based on active tab */}
              <div className="flex-1 overflow-hidden">
                {rightPanelTab === 'build-history' ? (
                  <BuildHistory />
                ) : (
                  <div className="h-full flex flex-col">
                    {/* Console Header */}
                    <div className="p-3 border-b border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Console
                        </h3>
                        <button
                          onClick={clearLogs}
                          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          Limpar
                        </button>
                      </div>
                      {/* Filter Buttons */}
                      <div className="flex items-center gap-1">
                        {(['all', 'build', 'success', 'error'] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setLogFilter(filter)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              logFilter === filter
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {filter === 'all' ? 'Todos' : filter === 'build' ? 'Info' : filter === 'success' ? 'Sucesso' : 'Erros'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Log List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {filteredLogs.map((log) => {
                        const styles = logTypeStyles[log.type];
                        return (
                          <div
                            key={log.id}
                            className={`p-2 rounded-lg ${styles.bg} border ${styles.border}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                                <span className="text-xs font-medium text-slate-300">
                                  {log.source}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">
                                {formatTime(log.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed pl-4">
                              {log.message}
                            </p>
                          </div>
                        );
                      })}
                      {filteredLogs.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-slate-500 text-sm">Nenhum log encontrado</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Modals */}
      <ProjectSetup
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        project={currentProject}
        onConfirm={handleSquadSetupConfirm}
      />

      <CreateWorkspaceModal
        isOpen={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
        onCreate={handleCreateWorkspace}
        projectId={currentProject?.id || ''}
      />
    </div>
  );
};
