import { create } from 'zustand';
import { Project, LogEntry, Toast, Suggestion } from '../types';
import { allSquads } from '../data/squads';

interface AppState {
  // Navigation
  currentPage: 'portfolio' | 'dashboard' | 'governance' | 'agent-evaluation' | 'strike-system' | 'threshold-system' | 'appeals' | 'feedback-loop' | 'council' | 'public-exceptions' | 'regional-adaptation' | 'health-metrics';
  setCurrentPage: (page: 'portfolio' | 'dashboard' | 'governance' | 'agent-evaluation' | 'strike-system' | 'threshold-system' | 'appeals' | 'feedback-loop' | 'council' | 'public-exceptions' | 'regional-adaptation' | 'health-metrics') => void;

  // Projects
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  createProject: (name: string, description: string, squads: string[]) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // UI State
  sidebarCollapsed: boolean;
  chatPanelCollapsed: boolean;
  consoleHeight: number;
  toggleSidebar: () => void;
  toggleChatPanel: () => void;
  setConsoleHeight: (height: number) => void;

  // Logs
  logs: LogEntry[];
  logFilter: 'all' | 'build' | 'error' | 'success';
  autoScroll: boolean;
  logSearch: string;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  setLogFilter: (filter: 'all' | 'build' | 'error' | 'success') => void;
  setAutoScroll: (enabled: boolean) => void;
  setLogSearch: (search: string) => void;

  // Squads
  expandedSquads: string[];
  toggleSquad: (id: string) => void;
  expandAllSquads: () => void;
  collapseAllSquads: () => void;

  // Selected Agent
  selectedAgent: string | null;
  setSelectedAgent: (id: string | null) => void;

  // Toasts
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Suggestions
  suggestions: Suggestion[];
  addSuggestion: (suggestion: Omit<Suggestion, 'id'>) => void;
  removeSuggestion: (id: string) => void;
}

// Sample projects
const sampleProjects: Project[] = [
  {
    id: 'doniq',
    name: 'Doniq',
    description: 'Sistema de controle de estoque completo com gestão de produtos, clientes, fornecedores, movimentações e relatórios.',
    status: 'active',
    progress: 72,
    lastActivity: new Date(),
    squads: ['aios', 'data', 'copy', 'design'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
  },
  {
    id: 'meu-site',
    name: 'Meu Site',
    description: 'Website institucional com foco em conversão, SEO otimizado e experiência do usuário premium.',
    status: 'active',
    progress: 45,
    lastActivity: new Date(Date.now() - 3600000),
    squads: ['design', 'copy'],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date(),
  },
  {
    id: 'app-mobile',
    name: 'App Mobile',
    description: 'Aplicativo React Native para gestão de tarefas com sincronização em tempo real e notificações push.',
    status: 'paused',
    progress: 30,
    lastActivity: new Date(Date.now() - 86400000),
    squads: ['aios'],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date(),
  },
];

// Sample logs
const sampleLogs: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 60000), type: 'info', source: 'AIOS Dev', message: 'Iniciando build do módulo de estoque...' },
  { id: '2', timestamp: new Date(Date.now() - 55000), type: 'info', source: 'QA Agent', message: 'Verificando cobertura de testes...' },
  { id: '3', timestamp: new Date(Date.now() - 50000), type: 'success', source: 'PM Agent', message: 'Sprint 4 concluída com 95% de completion' },
  { id: '4', timestamp: new Date(Date.now() - 45000), type: 'warning', source: 'Architect', message: 'Sugestão pendente: refatorar módulo de relatórios' },
  { id: '5', timestamp: new Date(Date.now() - 40000), type: 'error', source: 'DevOps', message: 'Timeout na conexão com banco de dados staging' },
  { id: '6', timestamp: new Date(Date.now() - 35000), type: 'info', source: 'Data Engineer', message: 'Pipeline de métricas atualizado' },
  { id: '7', timestamp: new Date(Date.now() - 30000), type: 'success', source: 'UX Design Expert', message: 'Wireframes do dashboard aprovados' },
  { id: '8', timestamp: new Date(Date.now() - 25000), type: 'info', source: 'Squad Creator', message: 'Novo agente QA alocado para o projeto' },
  { id: '9', timestamp: new Date(Date.now() - 20000), type: 'success', source: 'AIOS Dev', message: 'Feature: gestão de fornecedores implementada' },
  { id: '10', timestamp: new Date(Date.now() - 15000), type: 'warning', source: 'Copy Squad', message: 'Esperando aprovação das descrições de produtos' },
];

// Sample suggestions
const sampleSuggestions: Suggestion[] = [
  {
    id: '1',
    icon: '💡',
    text: 'Baseado no projeto Doniq, sugeriria focar no módulo de relatórios para finalizar a sprint.',
    actions: [{ label: 'Ver Detalhes', action: 'view-reports' }, { label: 'Aplicar', action: 'apply-suggestion' }],
  },
  {
    id: '2',
    icon: '🎯',
    text: 'Você sabia que Alex Hormozi recomenda focar em ofertas de alto valor para maximizar conversões?',
    actions: [{ label: 'Saber Mais', action: 'learn-more' }, { label: 'Ignorar', action: 'dismiss' }],
  },
  {
    id: '3',
    icon: '📊',
    text: 'O Data Squad detectou uma oportunidade de otimização no funil de vendas.',
    actions: [{ label: 'Analisar', action: 'analyze-funnel' }, { label: 'Mais Tarde', action: 'snooze' }],
  },
];

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  currentPage: 'portfolio',
  setCurrentPage: (page) => set({ currentPage: page }),

  // Projects
  projects: sampleProjects,
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project, currentPage: project ? 'dashboard' : 'portfolio' }),

  createProject: (name, description, squads) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      status: 'active',
      progress: 0,
      lastActivity: new Date(),
      squads,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
    get().addToast('success', `Projeto "${name}" criado com sucesso!`);
  },

  updateProject: (id, data) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...data, updatedAt: new Date() }
          : state.currentProject,
    }));
  },

  deleteProject: (id) => {
    const project = get().projects.find((p) => p.id === id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
      currentPage: state.currentProject?.id === id ? 'portfolio' : state.currentPage,
    }));
    if (project) {
      get().addToast('info', `Projeto "${project.name}" removido.`);
    }
  },

  // UI State
  sidebarCollapsed: false,
  chatPanelCollapsed: false,
  consoleHeight: 200,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleChatPanel: () => set((state) => ({ chatPanelCollapsed: !state.chatPanelCollapsed })),
  setConsoleHeight: (height) => set({ consoleHeight: height }),

  // Logs
  logs: sampleLogs,
  logFilter: 'all',
  autoScroll: true,
  logSearch: '',
  addLog: (entry) => {
    const newLog: LogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date(),
    };
    set((state) => ({ logs: [...state.logs, newLog] }));
  },
  clearLogs: () => set({ logs: [] }),
  setLogFilter: (filter) => set({ logFilter: filter }),
  setAutoScroll: (enabled) => set({ autoScroll: enabled }),
  setLogSearch: (search) => set({ logSearch: search }),

  // Squads
  expandedSquads: ['clevel', 'aios', 'brand', 'copy'],
  toggleSquad: (id) => {
    set((state) => ({
      expandedSquads: state.expandedSquads.includes(id)
        ? state.expandedSquads.filter((s) => s !== id)
        : [...state.expandedSquads, id],
    }));
  },
  expandAllSquads: () => set({ expandedSquads: allSquads.map((s) => s.id) }),
  collapseAllSquads: () => set({ expandedSquads: [] }),

  // Selected Agent
  selectedAgent: null,
  setSelectedAgent: (id) => set({ selectedAgent: id }),

  // Toasts
  toasts: [],
  addToast: (type, message) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // Suggestions
  suggestions: sampleSuggestions,
  addSuggestion: (suggestion) => {
    set((state) => ({
      suggestions: [...state.suggestions, { ...suggestion, id: `suggestion-${Date.now()}` }],
    }));
  },
  removeSuggestion: (id) => set((state) => ({ suggestions: state.suggestions.filter((s) => s.id !== id) })),
}));
