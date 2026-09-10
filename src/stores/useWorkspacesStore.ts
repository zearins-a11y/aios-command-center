import { create } from 'zustand';
import {
  Workspace,
  WorkspaceTask,
  WorkspaceLog,
  SquadSuggestion,
} from '../types/workspaces';

interface WorkspacesState {
  // Workspaces
  workspaces: Workspace[];

  // Selected Workspace
  selectedWorkspaceId: string | null;

  // Project Setup
  showProjectSetup: boolean;
  currentSetupProjectId: string | null;
  squadSuggestions: SquadSuggestion[];

  // Actions - Workspaces
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateWorkspace: (id: string, data: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setSelectedWorkspace: (id: string | null) => void;
  pauseWorkspace: (id: string) => void;
  resumeWorkspace: (id: string) => void;
  blockWorkspace: (id: string, reason: string) => void;
  unblockWorkspace: (id: string) => void;

  // Actions - Tasks
  addTask: (workspaceId: string, task: Omit<WorkspaceTask, 'id'>) => void;
  updateTask: (workspaceId: string, taskId: string, data: Partial<WorkspaceTask>) => void;
  deleteTask: (workspaceId: string, taskId: string) => void;

  // Actions - Logs
  addWorkspaceLog: (workspaceId: string, log: Omit<WorkspaceLog, 'id' | 'timestamp'>) => void;

  // Actions - Project Setup
  openProjectSetup: (projectId: string) => void;
  closeProjectSetup: () => void;
  initializeSuggestions: (projectName: string, projectDescription: string) => void;
  toggleSquadSelection: (squadId: string) => void;
  setSquadConfidence: (squadId: string, confidence: number) => void;

  // Getters
  getWorkspacesByProject: (projectId: string) => Workspace[];
  getSelectedWorkspace: () => Workspace | null;
}

// Generate workspace ID
const generateId = () => `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Analyze project and generate squad suggestions
const analyzeProjectForSquads = (name: string, description: string): SquadSuggestion[] => {
  const text = `${name} ${description}`.toLowerCase();

  const suggestions: SquadSuggestion[] = [];

  // AIOS Squad - Always suggested for technical projects
  if (text.includes('sistema') || text.includes('app') || text.includes('web') ||
      text.includes('mobile') || text.includes('backend') || text.includes('frontend') ||
      text.includes('software') || text.includes('desenvolvimento') || text.includes('api')) {
    suggestions.push({
      squadId: 'aios',
      name: 'AIOS',
      icon: '⚙️',
      confidence: 95,
      status: 'suggested',
      reason: 'Projeto técnico requer desenvolvimento e QA',
      description: 'Dev, QA, Architect para construir backend',
      agentCount: 10,
    });
  }

  // Data Squad - For analytics/reporting projects
  if (text.includes('métricas') || text.includes('relatório') || text.includes('analytics') ||
      text.includes('dashboard') || text.includes('dados') || text.includes('estoque') ||
      text.includes('vendas') || text.includes('análise')) {
    suggestions.push({
      squadId: 'data',
      name: 'Data Squad',
      icon: '📈',
      confidence: 88,
      status: 'suggested',
      reason: 'Projeto com foco em métricas e análise de dados',
      description: 'Análise de métricas e construção de dashboards',
      agentCount: 7,
    });
  }

  // Design Squad - For UI/UX heavy projects
  if (text.includes('design') || text.includes('ui') || text.includes('ux') ||
      text.includes('interface') || text.includes('website') || text.includes('landing') ||
      text.includes('website') || text.includes('site')) {
    suggestions.push({
      squadId: 'design',
      name: 'Design Squad',
      icon: '🎯',
      confidence: 82,
      status: 'suggested',
      reason: 'Projeto requer design de interface',
      description: 'UI/UX do sistema',
      agentCount: 8,
    });
  }

  // Brand Squad - For brand-focused projects
  if (text.includes('marca') || text.includes('brand') || text.includes('identidade') ||
      text.includes('posicionamento')) {
    suggestions.push({
      squadId: 'brand',
      name: 'Brand Squad',
      icon: '🎨',
      confidence: 75,
      status: 'optional',
      reason: 'Projeto com foco em marca',
      description: 'Identidade visual e posicionamento',
      agentCount: 8,
    });
  }

  // Copy Squad - For content-focused projects
  if (text.includes('copy') || text.includes('texto') || text.includes('conteúdo') ||
      text.includes('landing') || text.includes('email') || text.includes('notificação')) {
    suggestions.push({
      squadId: 'copy',
      name: 'Copy Squad',
      icon: '📝',
      confidence: 70,
      status: 'optional',
      reason: 'Projeto requer textos e copywriting',
      description: 'Textos do sistema, notificações',
      agentCount: 12,
    });
  }

  // Cybersecurity - For security-sensitive projects
  if (text.includes('seguro') || text.includes('dados sensíveis') || text.includes('financeiro') ||
      text.includes('payment') || text.includes('pagemento')) {
    suggestions.push({
      squadId: 'cybersecurity',
      name: 'Cybersecurity',
      icon: '🔒',
      confidence: 65,
      status: 'optional',
      reason: 'Projeto requer auditoria de segurança',
      description: 'Auditoria de segurança dos dados',
      agentCount: 17,
    });
  }

  // Traffic Masters - For marketing/acquisition projects
  if (text.includes('tráfego') || text.includes('ads') || text.includes('marketing') ||
      text.includes('aquisição') || text.includes('publicidade') || text.includes('paid')) {
    suggestions.push({
      squadId: 'traffic',
      name: 'Traffic Masters',
      icon: '📢',
      confidence: 60,
      status: 'optional',
      reason: 'Projeto focado em aquisição de tráfego',
      description: 'Gestão de campanhas pagas',
      agentCount: 18,
    });
  }

  // Not recommended: Traffic Masters for internal systems
  if (text.includes('interno') || text.includes('erp') || text.includes('sistema interno') ||
      text.includes('controle')) {
    const trafficSuggestion = suggestions.find(s => s.squadId === 'traffic');
    if (trafficSuggestion) {
      trafficSuggestion.status = 'not_recommended';
      trafficSuggestion.reason = 'Este é sistema interno, não precisa de aquisição de tráfego pago';
      trafficSuggestion.confidence = 20;
    }
  }

  return suggestions;
};

// Sample workspaces for Doniq project
const sampleWorkspaces: Workspace[] = [
  {
    id: 'ws-doniq-backend',
    projectId: 'doniq',
    name: 'Backend/API',
    type: 'backend',
    status: 'active',
    progress: 65,
    squads: ['aios'],
    agents: [
      { agentId: 'dev', squadId: 'aios', status: 'working' },
      { agentId: 'qa', squadId: 'aios', status: 'working' },
    ],
    tasks: [
      { id: 't1', title: 'Schema do banco definido', status: 'done' },
      { id: 't2', title: 'API de produtos (CRUD)', status: 'done' },
      { id: 't3', title: 'API de clientes (CRUD)', status: 'done' },
      { id: 't4', title: 'API de movimentações - em desenvolvimento', status: 'in_progress' },
      { id: 't5', title: 'Testes E2E', status: 'pending' },
      { id: 't6', title: 'Deploy staging', status: 'pending' },
    ],
    logs: [
      { id: 'l1', timestamp: new Date(Date.now() - 300000), type: 'success', agent: '@dev', message: 'endpoint POST /movements criado' },
      { id: 'l2', timestamp: new Date(Date.now() - 360000), type: 'info', agent: '@qa', message: 'testando validação de entrada' },
      { id: 'l3', timestamp: new Date(Date.now() - 420000), type: 'success', agent: '@dev', message: 'API de clientes finalizada' },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
  {
    id: 'ws-doniq-frontend',
    projectId: 'doniq',
    name: 'Frontend Dashboard',
    type: 'frontend',
    status: 'awaiting_approval',
    progress: 30,
    squads: ['aios', 'design'],
    agents: [
      { agentId: 'ux', squadId: 'aios', status: 'idle' },
      { agentId: 'design-chief', squadId: 'design', status: 'idle' },
    ],
    tasks: [
      { id: 't1', title: 'Wireframes do dashboard', status: 'done' },
      { id: 't2', title: 'Design system base', status: 'in_progress' },
      { id: 't3', title: 'Componentes React', status: 'pending' },
      { id: 't4', title: 'Integração com API', status: 'pending' },
    ],
    logs: [
      { id: 'l1', timestamp: new Date(Date.now() - 7200000), type: 'info', agent: '@ux', message: 'Wireframesapproved, starting implementation' },
    ],
    blockedReason: 'Aguardando aprovação do operador para iniciar implementação',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
  {
    id: 'ws-doniq-mobile',
    projectId: 'doniq',
    name: 'Mobile App',
    type: 'mobile',
    status: 'paused',
    progress: 10,
    squads: ['aios'],
    agents: [],
    tasks: [
      { id: 't1', title: 'Setup React Native', status: 'done' },
      { id: 't2', title: 'Navegação base', status: 'pending' },
      { id: 't3', title: 'Telas principais', status: 'pending' },
    ],
    logs: [
      { id: 'l1', timestamp: new Date(Date.now() - 86400000), type: 'warning', agent: 'System', message: 'Project paused - awaiting decision' },
    ],
    blockedReason: 'Aguardando decisão sobre escopo mobile',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date(Date.now() - 86400000),
  },
  // Meu Site workspaces
  {
    id: 'ws-site-landing',
    projectId: 'meu-site',
    name: 'Landing Page',
    type: 'frontend',
    status: 'active',
    progress: 80,
    squads: ['design', 'copy'],
    agents: [
      { agentId: 'design-chief', squadId: 'design', status: 'working' },
      { agentId: 'copy-chief', squadId: 'copy', status: 'working' },
    ],
    tasks: [
      { id: 't1', title: 'Estrutura HTML', status: 'done' },
      { id: 't2', title: 'Design responsivo', status: 'done' },
      { id: 't3', title: 'Copywriting', status: 'in_progress' },
      { id: 't4', title: 'Otimização SEO', status: 'pending' },
    ],
    logs: [
      { id: 'l1', timestamp: new Date(Date.now() - 1800000), type: 'success', agent: '@design-chief', message: 'Design finalized' },
    ],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
  },
  {
    id: 'ws-site-seo',
    projectId: 'meu-site',
    name: 'SEO & Analytics',
    type: 'data',
    status: 'paused',
    progress: 20,
    squads: ['data', 'traffic'],
    agents: [],
    tasks: [
      { id: 't1', title: 'Setup Google Analytics', status: 'done' },
      { id: 't2', title: 'SEO técnico', status: 'pending' },
      { id: 't3', title: 'Search Console setup', status: 'pending' },
    ],
    logs: [],
    blockedReason: 'Aguardando lançamento da landing page',
    createdAt: new Date('2024-02-25'),
    updatedAt: new Date(Date.now() - 172800000),
  },
];

export const useWorkspacesStore = create<WorkspacesState>((set, get) => ({
  // Initial state
  workspaces: sampleWorkspaces,
  selectedWorkspaceId: null,
  showProjectSetup: false,
  currentSetupProjectId: null,
  squadSuggestions: [],

  // Actions - Workspaces
  addWorkspace: (workspaceData) => {
    const id = generateId();
    const workspace: Workspace = {
      ...workspaceData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      workspaces: [...state.workspaces, workspace],
    }));
    return id;
  },

  updateWorkspace: (id, data) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, ...data, updatedAt: new Date() } : w
      ),
    }));
  },

  deleteWorkspace: (id) => {
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      selectedWorkspaceId: state.selectedWorkspaceId === id ? null : state.selectedWorkspaceId,
    }));
  },

  setSelectedWorkspace: (id) => {
    set({ selectedWorkspaceId: id });
  },

  pauseWorkspace: (id) => {
    get().updateWorkspace(id, { status: 'paused' });
  },

  resumeWorkspace: (id) => {
    get().updateWorkspace(id, { status: 'active' });
  },

  blockWorkspace: (id, reason) => {
    get().updateWorkspace(id, { status: 'blocked', blockedReason: reason });
  },

  unblockWorkspace: (id) => {
    get().updateWorkspace(id, { status: 'active', blockedReason: undefined });
  },

  // Actions - Tasks
  addTask: (workspaceId, taskData) => {
    const task: WorkspaceTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    get().updateWorkspace(workspaceId, {
      tasks: [...(get().workspaces.find((w) => w.id === workspaceId)?.tasks || []), task],
    });
  },

  updateTask: (workspaceId, taskId, data) => {
    const workspace = get().workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      const updatedTasks = workspace.tasks.map((t) =>
        t.id === taskId ? { ...t, ...data } : t
      );
      get().updateWorkspace(workspaceId, { tasks: updatedTasks });
    }
  },

  deleteTask: (workspaceId, taskId) => {
    const workspace = get().workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      const updatedTasks = workspace.tasks.filter((t) => t.id !== taskId);
      get().updateWorkspace(workspaceId, { tasks: updatedTasks });
    }
  },

  // Actions - Logs
  addWorkspaceLog: (workspaceId, logData) => {
    const log: WorkspaceLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date(),
    };
    const workspace = get().workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      get().updateWorkspace(workspaceId, {
        logs: [log, ...workspace.logs.slice(0, 49)], // Keep last 50 logs
      });
    }
  },

  // Actions - Project Setup
  openProjectSetup: (projectId) => {
    set({ showProjectSetup: true, currentSetupProjectId: projectId });
  },

  closeProjectSetup: () => {
    set({ showProjectSetup: false, currentSetupProjectId: null, squadSuggestions: [] });
  },

  initializeSuggestions: (projectName, projectDescription) => {
    const suggestions = analyzeProjectForSquads(projectName, projectDescription);
    set({ squadSuggestions: suggestions });
  },

  toggleSquadSelection: (squadId) => {
    set((state) => ({
      squadSuggestions: state.squadSuggestions.map((s) =>
        s.squadId === squadId
          ? {
              ...s,
              status: s.status === 'selected'
                ? (s.confidence && s.confidence >= 75 ? 'suggested' : 'optional')
                : 'selected',
            }
          : s
      ),
    }));
  },

  setSquadConfidence: (squadId, confidence) => {
    set((state) => ({
      squadSuggestions: state.squadSuggestions.map((s) =>
        s.squadId === squadId ? { ...s, confidence } : s
      ),
    }));
  },

  // Getters
  getWorkspacesByProject: (projectId) => {
    return get().workspaces.filter((w) => w.projectId === projectId);
  },

  getSelectedWorkspace: () => {
    const { workspaces, selectedWorkspaceId } = get();
    return workspaces.find((w) => w.id === selectedWorkspaceId) || null;
  },
}));
