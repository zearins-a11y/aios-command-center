import React from 'react';
import { ChevronRight, ChevronDown, Users, Shield, ClipboardCheck, AlertTriangle, BrainCircuit, Scale, RefreshCw, UserCircle, AlertOctagon, Globe, Activity } from 'lucide-react';
import { Badge, StatusDot } from '../ui';
import { useStore } from '../../stores/useStore';
import { useGovernanceStore } from '../../stores/useGovernanceStore';
import { allSquads } from '../../data/squads';
import { Squad } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    sidebarCollapsed,
    expandedSquads,
    toggleSquad,
    expandAllSquads,
    collapseAllSquads,
    currentProject,
    addLog,
    setCurrentPage,
    currentPage,
  } = useStore();

  const pendingApprovals = useGovernanceStore((state) => state.pendingApprovals);
  const pendingCount = pendingApprovals.length;

  const handleSquadClick = (squad: Squad) => {
    toggleSquad(squad.id);
    addLog({
      type: 'info',
      source: 'System',
      message: `${squad.name} ${expandedSquads.includes(squad.id) ? 'recolhido' : 'expandido'}`,
    });
  };

  const handleAgentClick = (agentName: string, squadName: string) => {
    addLog({
      type: 'info',
      source: 'System',
      message: `Agente selecionado: ${agentName} (${squadName})`,
    });
  };

  // Get squads for current project or all squads
  const displaySquads = currentProject
    ? allSquads.filter(s => currentProject.squads.includes(s.id))
    : allSquads;

  // Filter out advisory from main list (it's nested under C-Level)
  const topLevelSquads = displaySquads.filter(s => s.parentId === null);
  const cLevelSquad = displaySquads.find(s => s.id === 'clevel');
  const advisoryBoard = displaySquads.find(s => s.id === 'advisory');

  if (sidebarCollapsed) {
    return (
      <aside className="w-16 bg-bg-secondary border-r border-border-default flex flex-col items-center py-4 gap-4">
        <button
          onClick={() => setCurrentPage('governance')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'governance'
              ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Governance"
        >
          <Shield size={20} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentPage('agent-evaluation')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'agent-evaluation'
              ? 'bg-[#6366f1]/20 text-[#6366f1]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Avaliação de Agentes"
        >
          <ClipboardCheck size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('strike-system')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'strike-system'
              ? 'bg-red-500/20 text-red-400'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Strike System"
        >
          <AlertTriangle size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('threshold-system')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'threshold-system'
              ? 'bg-[#a855f7]/20 text-[#a855f7]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Confidence Thresholds"
        >
          <BrainCircuit size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('appeals')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'appeals'
              ? 'bg-[#6366f1]/20 text-[#6366f1]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Appeals Process"
        >
          <Scale size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('feedback-loop')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'feedback-loop'
              ? 'bg-[#06b6d4]/20 text-[#06b6d4]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Feedback Loop"
        >
          <RefreshCw size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('council')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'council'
              ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Advisory Council"
        >
          <UserCircle size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('public-exceptions')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'public-exceptions'
              ? 'bg-[#f59e0b]/20 text-[#f59e0b]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Public Exceptions"
        >
          <AlertOctagon size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('regional-adaptation')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'regional-adaptation'
              ? 'bg-[#06b6d4]/20 text-[#06b6d4]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Regional Adaptation"
        >
          <Globe size={20} />
        </button>
        <button
          onClick={() => setCurrentPage('health-metrics')}
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            currentPage === 'health-metrics'
              ? 'bg-[#22c55e]/20 text-[#22c55e]'
              : 'hover:bg-bg-card text-text-muted'
          }`}
          title="Health Metrics"
        >
          <Activity size={20} />
        </button>
        <div className="h-px w-8 bg-border-default" />
        <div className="text-2xl" title="C-Level">📊</div>
        <div className="text-2xl" title="AIOS">⚙️</div>
        <div className="text-2xl" title="Brand">🎨</div>
        <div className="text-2xl" title="Copy">📝</div>
        <div className="text-2xl" title="Data">📈</div>
        <div className="text-2xl" title="Design">🎯</div>
        <div className="text-2xl" title="Hormozi">💰</div>
      </aside>
    );
  }

  return (
    <aside className="w-60 bg-bg-secondary border-r border-border-default flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-default">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Users size={14} />
            Squads
          </h2>
          <div className="flex gap-1">
            <button
              onClick={expandAllSquads}
              className="p-1 hover:bg-bg-card rounded text-text-dim hover:text-text-muted transition-colors text-xs"
              title="Expandir todos"
            >
              +
            </button>
            <button
              onClick={collapseAllSquads}
              className="p-1 hover:bg-bg-card rounded text-text-dim hover:text-text-muted transition-colors text-xs"
              title="Recolher todos"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* Squad Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Governance Link */}
        <button
          onClick={() => setCurrentPage('governance')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'governance'
              ? 'bg-[#fbbf24]/20 border border-[#fbbf24]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <Shield
            size={20}
            className={currentPage === 'governance' ? 'text-[#fbbf24]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'governance' ? 'text-[#fbbf24]' : 'text-text-primary'
              }`}
            >
              Governance
            </span>
            <span className="text-xs text-text-dim">Controle e aprovacao</span>
          </div>
          {pendingCount > 0 && (
            <span className="relative flex h-5 w-5">
              {pendingCount > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-[10px] font-bold text-white">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            </span>
          )}
        </button>

        {/* Agent Evaluation Link */}
        <button
          onClick={() => setCurrentPage('agent-evaluation')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'agent-evaluation'
              ? 'bg-[#6366f1]/20 border border-[#6366f1]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <ClipboardCheck
            size={20}
            className={currentPage === 'agent-evaluation' ? 'text-[#6366f1]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'agent-evaluation' ? 'text-[#6366f1]' : 'text-text-primary'
              }`}
            >
              Avaliacao de Agentes
            </span>
            <span className="text-xs text-text-dim">Gaps e integracao</span>
          </div>
        </button>

        {/* Strike System Link */}
        <button
          onClick={() => setCurrentPage('strike-system')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'strike-system'
              ? 'bg-red-500/20 border border-red-500/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <AlertTriangle
            size={20}
            className={currentPage === 'strike-system' ? 'text-red-400' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'strike-system' ? 'text-red-400' : 'text-text-primary'
              }`}
            >
              Strike System
            </span>
            <span className="text-xs text-text-dim">Warnings progressivos</span>
          </div>
        </button>

        {/* Threshold System Link */}
        <button
          onClick={() => setCurrentPage('threshold-system')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'threshold-system'
              ? 'bg-[#a855f7]/20 border border-[#a855f7]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <BrainCircuit
            size={20}
            className={currentPage === 'threshold-system' ? 'text-[#a855f7]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'threshold-system' ? 'text-[#a855f7]' : 'text-text-primary'
              }`}
            >
              Thresholds
            </span>
            <span className="text-xs text-text-dim">Confiança IA</span>
          </div>
        </button>

        {/* Appeals Link */}
        <button
          onClick={() => setCurrentPage('appeals')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'appeals'
              ? 'bg-[#6366f1]/20 border border-[#6366f1]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <Scale
            size={20}
            className={currentPage === 'appeals' ? 'text-[#6366f1]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'appeals' ? 'text-[#6366f1]' : 'text-text-primary'
              }`}
            >
              Recursos
            </span>
            <span className="text-xs text-text-dim">Processo de Appeals</span>
          </div>
        </button>

        {/* Feedback Loop Link */}
        <button
          onClick={() => setCurrentPage('feedback-loop')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'feedback-loop'
              ? 'bg-[#06b6d4]/20 border border-[#06b6d4]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <RefreshCw
            size={20}
            className={currentPage === 'feedback-loop' ? 'text-[#06b6d4]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'feedback-loop' ? 'text-[#06b6d4]' : 'text-text-primary'
              }`}
            >
              Feedback Loop
            </span>
            <span className="text-xs text-text-dim">Melhoria contínua</span>
          </div>
        </button>

        {/* Council Link */}
        <button
          onClick={() => setCurrentPage('council')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'council'
              ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <UserCircle
            size={20}
            className={currentPage === 'council' ? 'text-[#8b5cf6]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'council' ? 'text-[#8b5cf6]' : 'text-text-primary'
              }`}
            >
              Conselho
            </span>
            <span className="text-xs text-text-dim">Consultivo Externo</span>
          </div>
        </button>

        {/* Public Exceptions Link */}
        <button
          onClick={() => setCurrentPage('public-exceptions')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'public-exceptions'
              ? 'bg-[#f59e0b]/20 border border-[#f59e0b]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <AlertOctagon
            size={20}
            className={currentPage === 'public-exceptions' ? 'text-[#f59e0b]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'public-exceptions' ? 'text-[#f59e0b]' : 'text-text-primary'
              }`}
            >
              Exceções
            </span>
            <span className="text-xs text-text-dim">Públicas</span>
          </div>
        </button>

        {/* Regional Adaptation Link */}
        <button
          onClick={() => setCurrentPage('regional-adaptation')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'regional-adaptation'
              ? 'bg-[#06b6d4]/20 border border-[#06b6d4]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <Globe
            size={20}
            className={currentPage === 'regional-adaptation' ? 'text-[#06b6d4]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'regional-adaptation' ? 'text-[#06b6d4]' : 'text-text-primary'
              }`}
            >
              Regional
            </span>
            <span className="text-xs text-text-dim">Adaptação</span>
          </div>
        </button>

        {/* Health Metrics Link */}
        <button
          onClick={() => setCurrentPage('health-metrics')}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-3 transition-all
            ${currentPage === 'health-metrics'
              ? 'bg-[#22c55e]/20 border border-[#22c55e]/30'
              : 'hover:bg-bg-card border border-transparent'
            }
          `}
        >
          <Activity
            size={20}
            className={currentPage === 'health-metrics' ? 'text-[#22c55e]' : 'text-text-muted'}
          />
          <div className="flex-1 text-left">
            <span
              className={`text-sm font-medium block ${
                currentPage === 'health-metrics' ? 'text-[#22c55e]' : 'text-text-primary'
              }`}
            >
              Saúde
            </span>
            <span className="text-xs text-text-dim">Métricas</span>
          </div>
        </button>

        <div className="h-px bg-border-default mb-3" />

        {/* C-Level Squad with Advisory */}
        {cLevelSquad && (
          <div className="mb-2">
            <button
              onClick={() => handleSquadClick(cLevelSquad)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bg-card transition-colors group"
            >
              <span className="text-lg">{cLevelSquad.icon}</span>
              <span className="flex-1 text-left text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                {cLevelSquad.name}
              </span>
              <Badge variant="gray" size="sm">
                {cLevelSquad.agents.length}
              </Badge>
              {expandedSquads.includes(cLevelSquad.id) ? (
                <ChevronDown size={14} className="text-text-dim" />
              ) : (
                <ChevronRight size={14} className="text-text-dim" />
              )}
            </button>

            {/* Advisory Board - Nested */}
            {advisoryBoard && expandedSquads.includes(cLevelSquad.id) && (
              <div className="ml-4 border-l border-border-default pl-2">
                <button
                  onClick={() => handleSquadClick(advisoryBoard)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bg-card transition-colors group"
                >
                  <span className="text-base">{advisoryBoard.icon}</span>
                  <span className="flex-1 text-left text-xs font-medium text-text-muted group-hover:text-primary transition-colors">
                    {advisoryBoard.name}
                  </span>
                  <Badge variant="gray" size="sm">
                    {advisoryBoard.agents.length}
                  </Badge>
                  {expandedSquads.includes(advisoryBoard.id) ? (
                    <ChevronDown size={12} className="text-text-dim" />
                  ) : (
                    <ChevronRight size={12} className="text-text-dim" />
                  )}
                </button>

                {/* Advisory Agents */}
                {expandedSquads.includes(advisoryBoard.id) && (
                  <div className="ml-2">
                    {advisoryBoard.agents.slice(0, 6).map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleAgentClick(agent.name, advisoryBoard.name)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-card transition-colors"
                      >
                        <StatusDot status={agent.status} size="sm" />
                        <span className="flex-1 text-left text-xs text-text-muted truncate">
                          {agent.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                    {advisoryBoard.agents.length > 6 && (
                      <span className="text-xs text-text-dim px-3 py-1">
                        +{advisoryBoard.agents.length - 6} mais
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Top Level Squads */}
        {topLevelSquads
          .filter(s => s.id !== 'clevel')
          .map((squad) => (
            <div key={squad.id} className="mb-1">
              <button
                onClick={() => handleSquadClick(squad)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bg-card transition-colors group"
              >
                <span className="text-lg">{squad.icon}</span>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors block">
                    {squad.name}
                  </span>
                  <span className="text-xs text-text-dim">{squad.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="gray" size="sm">
                    {squad.agents.length}
                  </Badge>
                  {expandedSquads.includes(squad.id) ? (
                    <ChevronDown size={14} className="text-text-dim" />
                  ) : (
                    <ChevronRight size={14} className="text-text-dim" />
                  )}
                </div>
              </button>

              {/* Agents List */}
              {expandedSquads.includes(squad.id) && (
                <div className="ml-4 border-l border-border-default pl-2">
                  {squad.agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentClick(agent.name, squad.name)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-card transition-colors"
                    >
                      <StatusDot status={agent.status} size="sm" pulse />
                      <span className="flex-1 text-left text-xs text-text-muted truncate">
                        {agent.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border-default">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-bg-card rounded-md p-2">
            <p className="text-lg font-bold text-success">
              {displaySquads.reduce((acc, s) => acc + s.agents.filter(a => a.status === 'available' || a.status === 'working').length, 0)}
            </p>
            <p className="text-xs text-text-dim">Ativos</p>
          </div>
          <div className="bg-bg-card rounded-md p-2">
            <p className="text-lg font-bold text-text-muted">
              {displaySquads.reduce((acc, s) => acc + s.agents.length, 0)}
            </p>
            <p className="text-xs text-text-dim">Total</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
