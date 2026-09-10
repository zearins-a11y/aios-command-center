import { create } from 'zustand';
import {
  AgentEvaluation,
  AgentFilters,
  filterEvaluations,
  summarizeEvaluations,
  EvaluationSummary,
  calculateOverallScore,
  getPriorityFromScore,
} from '../types/agentEvaluation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Initial seed data - placeholder evaluations from what we know
// Will be populated by AGENCY_AGENTS_EVALUATION.md report when ready
const seedEvaluations: AgentEvaluation[] = [
  // AIOS Framework Agents
  {
    id: 'aios-dev',
    name: 'Dev Agent',
    source: 'aios',
    sourcePath: '~/aios-core/agents/dev.md',
    category: 'engineering',
    description: 'Engenheiro de software full-stack. Implementa features, corrige bugs, refatora.',
    capabilities: ['Code Generation', 'Bug Fixing', 'Refactoring', 'Testing'],
    fitWithAios: 100,
    fitWithXquads: 80,
    reusability: 90,
    businessValue: 95,
    maintenanceCost: 80,
    status: 'have_it',
    recommendation: 'consolidate',
    reasoning: 'Core do AIOS framework, fundamental',
    evaluatedAt: new Date(),
    evaluatedBy: 'system',
  },
  {
    id: 'aios-qa',
    name: 'QA Agent',
    source: 'aios',
    sourcePath: '~/aios-core/agents/qa.md',
    category: 'engineering',
    description: 'Quality assurance. Tests, valida qualidade, identifica bugs.',
    capabilities: ['Test Automation', 'Quality Validation', 'Bug Detection'],
    fitWithAios: 100,
    fitWithXquads: 75,
    reusability: 85,
    businessValue: 90,
    maintenanceCost: 85,
    status: 'have_it',
    recommendation: 'consolidate',
    reasoning: 'Essencial para governance',
    evaluatedAt: new Date(),
    evaluatedBy: 'system',
  },
  // XQuads Squads
  {
    id: 'xquads-cybersecurity',
    name: 'Cybersecurity Squad',
    source: 'xquads',
    sourcePath: '~/.claude/commands/cybersecurity.md',
    category: 'operations',
    description: 'Squad focado em segurança, threat modeling, vulnerabilidade.',
    capabilities: ['Threat Modeling', 'Security Audit', 'Compliance'],
    fitWithAios: 75,
    fitWithXquads: 100,
    reusability: 80,
    businessValue: 95,
    maintenanceCost: 75,
    status: 'have_it',
    recommendation: 'integrate_now',
    reasoning: 'Alta prioridade para governance de tokens/credenciais',
    integrationSteps: [
      'Mapear capabilities ao Guardião',
      'Adicionar checks automáticos de segurança',
    ],
    estimatedHours: 16,
    evaluatedAt: new Date(),
    evaluatedBy: 'system',
  },
  {
    id: 'xquads-clevel',
    name: 'C-Level Squad',
    source: 'xquads',
    sourcePath: '~/.claude/commands/c-level-squad.md',
    category: 'strategy',
    description: 'Squad de executivos. Decisões estratégicas, governance.',
    capabilities: ['Strategic Decisions', 'Sensitive Actions Approval', 'Risk Management'],
    fitWithAios: 90,
    fitWithXquads: 100,
    reusability: 95,
    businessValue: 100,
    maintenanceCost: 90,
    status: 'have_it',
    recommendation: 'integrate_now',
    reasoning: 'Match perfeito com Sensitive Actions do Governance',
    integrationSteps: [
      'Mapear para Ações Sensíveis que requerem C-Level',
      'Adicionar regra de dupla aprovação',
    ],
    estimatedHours: 8,
    evaluatedAt: new Date(),
    evaluatedBy: 'system',
  },
  {
    id: 'xquads-data',
    name: 'Data Squad',
    source: 'xquads',
    sourcePath: '~/.claude/commands/data-squad.md',
    category: 'data',
    description: 'Análise de dados, métricas, BI.',
    capabilities: ['Data Analysis', 'KPI Tracking', 'Reporting'],
    fitWithAios: 85,
    fitWithXquads: 100,
    reusability: 80,
    businessValue: 85,
    maintenanceCost: 75,
    status: 'have_it',
    recommendation: 'integrate_later',
    reasoning: 'Útil para dashboards pós-MVP',
    estimatedHours: 24,
    evaluatedAt: new Date(),
    evaluatedBy: 'system',
  },
  // Local resources - Agent Command Center agents
  {
    id: 'agency-copywriter',
    name: 'Copywriter',
    source: 'local',
    sourcePath: 'Documents/ChatGPT/TEAM TESTE/local-agent-command-center/packages/api/src/lib/agents/copywriter.ts',
    category: 'creative',
    description: 'Copywriter para websites. Brief criativo, copy persuasivo.',
    capabilities: ['Copy Creation', 'Website Briefs', 'Headlines'],
    fitWithAios: 50,
    fitWithXquads: 60,
    reusability: 40,
    businessValue: 70,
    maintenanceCost: 50,
    status: 'duplicate',
    recommendation: 'replace_existing',
    reasoning: 'Já temos Copy Squad nos XQuads. Pode ser especializado em website copy.',
    evaluatedAt: new Date(),
    evaluatedBy: 'system',
  },
  // GitHub / Agency Agents placeholders - will be filled from AGENCY_AGENTS_EVALUATION.md
  {
    id: 'placeholder-1',
    name: '[Aguardando Avaliação]',
    source: 'agency-agents',
    sourcePath: 'https://github.com/zearins-a11y/agency-agents',
    category: 'other',
    description: 'Lista completa sendo avaliada pelo agente em background. Ver AGENCY_AGENTS_EVALUATION.md',
    capabilities: ['[TBD]'],
    fitWithAios: 0,
    fitWithXquads: 0,
    reusability: 0,
    businessValue: 0,
    maintenanceCost: 0,
    status: 'tbd',
    recommendation: 'integrate_later',
    reasoning: 'Aguardando relatório de avaliação',
    evaluatedAt: new Date(),
    evaluatedBy: 'system',
  },
];

interface EvaluationStore {
  evaluations: AgentEvaluation[];
  filters: AgentFilters;

  // CRUD
  addEvaluation: (evaluation: Omit<AgentEvaluation, 'id' | 'evaluatedAt'>) => void;
  updateEvaluation: (id: string, updates: Partial<AgentEvaluation>) => void;
  removeEvaluation: (id: string) => void;
  importEvaluations: (evaluations: AgentEvaluation[]) => void;

  // Filters
  setFilters: (filters: AgentFilters) => void;
  clearFilters: () => void;

  // Derived
  getFilteredEvaluations: () => AgentEvaluation[];
  getSummary: () => EvaluationSummary;
  getEvaluationById: (id: string) => AgentEvaluation | undefined;
  getOverallScore: (id: string) => number;
  getPriority: (id: string) => 'critical' | 'high' | 'medium' | 'low';

  // Supabase integration
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;
}

export const useEvaluationStore = create<EvaluationStore>((set, get) => ({
  evaluations: seedEvaluations,
  filters: {},

  addEvaluation: (evaluation) =>
    set((state) => ({
      evaluations: [
        ...state.evaluations,
        {
          ...evaluation,
          id: `eval-${Date.now()}`,
          evaluatedAt: new Date(),
        },
      ],
    })),

  updateEvaluation: (id, updates) =>
    set((state) => ({
      evaluations: state.evaluations.map((e) =>
        e.id === id ? { ...e, ...updates, evaluatedAt: new Date() } : e
      ),
    })),

  removeEvaluation: (id) =>
    set((state) => ({
      evaluations: state.evaluations.filter((e) => e.id !== id),
    })),

  importEvaluations: (newEvaluations) =>
    set((state) => ({
      // Replace placeholders with same source
      evaluations: [
        ...state.evaluations.filter(e => !newEvaluations.some(n => n.source === e.source && e.id.startsWith('placeholder'))),
        ...newEvaluations,
      ],
    })),

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  getFilteredEvaluations: () => {
    const { evaluations, filters } = get();
    return filterEvaluations(evaluations, filters);
  },

  getSummary: () => {
    const { evaluations } = get();
    return summarizeEvaluations(evaluations);
  },

  getEvaluationById: (id) => {
    return get().evaluations.find((e) => e.id === id);
  },

  getOverallScore: (id) => {
    const evaluation = get().evaluations.find((e) => e.id === id);
    if (!evaluation) return 0;
    return calculateOverallScore(evaluation);
  },

  getPriority: (id) => {
    const evaluation = get().evaluations.find((e) => e.id === id);
    if (!evaluation) return 'low';
    return getPriorityFromScore(calculateOverallScore(evaluation));
  },

  loadFromSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('agent_evaluations')
        .select('*')
        .order('evaluated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const loadedEvaluations: AgentEvaluation[] = data.map((db) => ({
          id: db.id,
          name: db.name || '',
          source: db.source || 'aios',
          sourcePath: db.source_path || '',
          category: db.category || 'general',
          description: db.description || '',
          capabilities: db.capabilities || [],
          fitWithAios: db.fit_with_aios || 0,
          fitWithXquads: db.fit_with_xquads || 0,
          reusability: db.reusability || 0,
          businessValue: db.business_value || 0,
          maintenanceCost: db.maintenance_cost || 0,
          status: db.status || 'tbd',
          recommendation: db.recommendation || 'evaluate',
          reasoning: db.reasoning || '',
          evaluatedAt: new Date(db.evaluated_at),
          evaluatedBy: db.evaluated_by || 'system',
        }));
        set({ evaluations: loadedEvaluations });
      }
    } catch (error) {
      console.error('Failed to load evaluations from Supabase:', error);
    }
  },

  syncToSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { evaluations } = get();
    try {
      for (const evaluation of evaluations) {
        await supabase.from('agent_evaluations').upsert({
          id: evaluation.id,
          name: evaluation.name,
          source: evaluation.source,
          source_path: evaluation.sourcePath,
          category: evaluation.category,
          description: evaluation.description,
          capabilities: evaluation.capabilities,
          fit_with_aios: evaluation.fitWithAios,
          fit_with_xquads: evaluation.fitWithXquads,
          reusability: evaluation.reusability,
          business_value: evaluation.businessValue,
          maintenance_cost: evaluation.maintenanceCost,
          status: evaluation.status,
          recommendation: evaluation.recommendation,
          reasoning: evaluation.reasoning,
          evaluated_at: evaluation.evaluatedAt.toISOString(),
          evaluated_by: evaluation.evaluatedBy,
        });
      }
    } catch (error) {
      console.error('Failed to sync evaluations to Supabase:', error);
    }
  },
}));
