import { create } from 'zustand';
import {
  CouncilMember,
  CouncilCase,
  CouncilOpinion,
  CouncilConfig,
  CouncilSpecialty,
  CouncilCaseStatus,
  DEFAULT_COUNCIL_CONFIG,
  COUNCIL_SPECIALTY_LABELS,
  COUNCIL_ROLE_LABELS,
  COUNCIL_STATUS_LABELS,
  calculateCouncilDecision,
  isQuorumMet,
  createCouncilCase,
  suggestMembersForCase,
} from '../utils/councilConsultive';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { loadFromLocal, saveToLocal } from '../lib/useLocalPersistence';
import type { CouncilMember as DbCouncilMember, CouncilCase as DbCouncilCase } from '../lib/types';

interface CouncilStore {
  // Data
  members: CouncilMember[];
  cases: CouncilCase[];

  // Configuration
  config: CouncilConfig;

  // Filters
  caseStatusFilter: CouncilCaseStatus | 'all';
  setCaseStatusFilter: (status: CouncilCaseStatus | 'all') => void;
  specialtyFilter: CouncilSpecialty | 'all';
  setSpecialtyFilter: (specialty: CouncilSpecialty | 'all') => void;

  // Member Actions
  addMember: (member: Omit<CouncilMember, 'id' | 'joinedAt' | 'casesReviewed' | 'opinionsIssued' | 'currentCasesCount'>) => void;
  updateMember: (memberId: string, updates: Partial<CouncilMember>) => void;
  deactivateMember: (memberId: string) => void;
  reactivateMember: (memberId: string) => void;

  // Case Actions
  createCase: (
    referenceId: string,
    referenceTitle: string,
    referenceType: CouncilCase['referenceType'],
    summary: string,
    context: string,
    questions: string[],
    category: CouncilSpecialty[],
    createdBy: string,
    priority?: CouncilCase['priority']
  ) => void;
  assignCase: (caseId: string, memberIds: string[]) => void;
  submitOpinion: (
    caseId: string,
    memberId: string,
    memberName: string,
    position: CouncilOpinion['position'],
    opinion: string,
    reasoning: string,
    confidence: number,
    concerns: string[],
    suggestions: string[]
  ) => void;
  closeCase: (caseId: string) => void;
  updateConfig: (updates: Partial<CouncilConfig>) => void;

  // Queries
  getActiveMembers: () => CouncilMember[];
  getAvailableMembers: () => CouncilMember[];
  getCaseById: (caseId: string) => CouncilCase | undefined;
  getCasesForMember: (memberId: string) => CouncilCase[];
  getPendingCases: () => CouncilCase[];
  getActiveCases: () => CouncilCase[];
  getCaseOpinions: (caseId: string) => CouncilOpinion[];
  suggestMembers: (requiredSpecialties: CouncilSpecialty[]) => CouncilMember[];
  getOverallStats: () => {
    totalMembers: number;
    activeMembers: number;
    totalCases: number;
    pendingCases: number;
    avgResolutionTime: number;
  };

  // Supabase integration
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;

  // Local persistence
  initialize: () => Promise<void>;
  persistToLocal: () => Promise<void>;
}

export const useCouncilStore = create<CouncilStore>((set, get) => ({
  members: [
    // Mock council members
    {
      id: 'member-1',
      name: 'Dra. Ana Carolina Silva',
      title: 'Advogada Sênior',
      organization: 'Silva & Associados',
      email: 'ana.silva@silvaadvogados.com',
      role: 'chair',
      specialties: ['legal', 'compliance', 'ethics'],
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      casesReviewed: 12,
      opinionsIssued: 11,
      avatar: undefined,
      bio: 'Especialista em direito digital e proteção de dados com 15 anos de experiência.',
      availability: 'available',
      maxCasesPerMonth: 5,
      currentCasesCount: 1,
    },
    {
      id: 'member-2',
      name: 'Prof. Marcos Oliveira',
      title: 'Diretor de Marca',
      organization: 'Universidade de São Paulo',
      email: 'marcos.oliveira@usp.br',
      role: 'member',
      specialties: ['brand', 'marketing', 'public_relations'],
      status: 'active',
      joinedAt: new Date('2024-02-20'),
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      casesReviewed: 8,
      opinionsIssued: 7,
      avatar: undefined,
      bio: 'Professor de marketing e gestão de marca com foco em branding corporativo.',
      availability: 'available',
      maxCasesPerMonth: 4,
      currentCasesCount: 2,
    },
    {
      id: 'member-3',
      name: 'Roberto Mendes',
      title: 'Chief Compliance Officer',
      organization: 'ComplianceMax',
      email: 'roberto@compliancemax.com',
      role: 'member',
      specialties: ['compliance', 'legal', 'technical'],
      status: 'active',
      joinedAt: new Date('2024-03-10'),
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 30),
      casesReviewed: 15,
      opinionsIssued: 14,
      avatar: undefined,
      bio: 'CCO certificado com experiência em compliance corporativo e LGPD.',
      availability: 'limited',
      maxCasesPerMonth: 3,
      currentCasesCount: 1,
    },
    {
      id: 'member-4',
      name: 'Juliana Ferreira',
      title: 'Diretora de Relações Públicas',
      organization: 'Ferreira Comunicação',
      email: 'juliana@ferreiracom.com',
      role: 'member',
      specialties: ['public_relations', 'marketing', 'brand'],
      status: 'active',
      joinedAt: new Date('2024-04-05'),
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      casesReviewed: 6,
      opinionsIssued: 5,
      avatar: undefined,
      bio: 'Especialista em comunicação corporativa e gestão de crises.',
      availability: 'available',
      maxCasesPerMonth: 4,
      currentCasesCount: 0,
    },
    {
      id: 'member-5',
      name: 'Dr. Paulo Henrique Santos',
      title: 'Consultor de Ética em IA',
      organization: 'ÉticaIA Consultoria',
      email: 'paulo.santos@eticaia.com',
      role: 'observer',
      specialties: ['ethics', 'technical', 'compliance'],
      status: 'active',
      joinedAt: new Date('2024-05-01'),
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      casesReviewed: 3,
      opinionsIssued: 2,
      avatar: undefined,
      bio: 'Consultor especializado em ética de inteligência artificial e vieses algorítmicos.',
      availability: 'available',
      maxCasesPerMonth: 3,
      currentCasesCount: 0,
    },
  ],

  cases: [
    // Mock cases
    {
      id: 'council-case-1',
      referenceId: 'approval-3',
      referenceTitle: 'Post sobre nova funcionalidade do produto',
      referenceType: 'approval',
      status: 'under_review',
      priority: 'elevated',
      category: ['brand', 'marketing'],
      assignedTo: ['member-1', 'member-2', 'member-3'],
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 48),
      summary: 'Verificar se o post sobre feature não violates brand guidelines.',
      context: 'O post menciona uma funcionalidade em desenvolvimento. O Guardião bloqueou por considerar informação prematura.',
      questions: [
        'O post compromete o lançamento oficial?',
        'O tom está adequado para a marca?',
        'Deve haver ajuste no copy?',
      ],
      relevantDocuments: [],
      opinions: [
        {
          id: 'opinion-1',
          memberId: 'member-1',
          memberName: 'Dra. Ana Carolina Silva',
          position: 'in_favor',
          opinion: 'O post pode ser publicado com ajustes mínimos.',
          reasoning: 'A funcionalidade já foi parcialmente revelada em eventos anteriores.',
          confidence: 85,
          concerns: [],
          suggestions: ['Adicionar disclaimer sobre "em breve"'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
          updatedAt: null,
          isFinal: false,
        },
        {
          id: 'opinion-2',
          memberId: 'member-2',
          memberName: 'Prof. Marcos Oliveira',
          position: 'in_favor',
          opinion: 'Aprovado com sugestões.',
          reasoning: 'O tom está adequado e gera expectativa positiva.',
          confidence: 90,
          concerns: [],
          suggestions: ['Destacar mais o benefício para o usuário'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
          updatedAt: null,
          isFinal: false,
        },
      ],
      finalOpinion: null,
      recommendation: 'no_action',
      confidence: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      closedAt: null,
      createdBy: 'Operador',
      tags: ['brand', 'timing'],
      requiresUnanimousDecision: false,
      votingDeadline: new Date(Date.now() + 1000 * 60 * 60 * 72),
    },
    {
      id: 'council-case-2',
      referenceId: 'appeal-1',
      referenceTitle: 'Recurso sobre post rejeitado',
      referenceType: 'appeal',
      status: 'opinion_issued',
      priority: 'normal',
      category: ['legal', 'compliance'],
      assignedTo: ['member-1', 'member-3'],
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24),
      summary: 'Analisar recurso sobre bloqueio por suposta violação de política.',
      context: 'O usuário recorreu do bloqueio de um post alegando que a política foi aplicada incorretamente.',
      questions: [
        'Houve erro na aplicação da política?',
        'O post deve ser aprovado ou mantido o bloqueio?',
      ],
      relevantDocuments: [],
      opinions: [
        {
          id: 'opinion-3',
          memberId: 'member-1',
          memberName: 'Dra. Ana Carolina Silva',
          position: 'against',
          opinion: 'Bloqueio mantido.',
          reasoning: 'A política foi aplicada corretamente. O post continha informação não verificada.',
          confidence: 95,
          concerns: ['Risco reputacional'],
          suggestions: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30),
          updatedAt: null,
          isFinal: false,
        },
        {
          id: 'opinion-4',
          memberId: 'member-3',
          memberName: 'Roberto Mendes',
          position: 'in_favor',
          opinion: 'Recurso aceito com condição.',
          reasoning: 'O post pode ser republicado se mencionado o status "não confirmado".',
          confidence: 80,
          concerns: [],
          suggestions: ['Adicionar nota de esclarecimento'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
          updatedAt: null,
          isFinal: false,
        },
      ],
      finalOpinion: 'Decisão dividida: bloqueio mantido, mas sugerida publicação com nota explicativa.',
      recommendation: 'modify',
      confidence: 87,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      closedAt: null,
      createdBy: 'Operador',
      tags: ['compliance', 'recurso'],
      requiresUnanimousDecision: false,
      votingDeadline: null,
    },
  ],

  config: DEFAULT_COUNCIL_CONFIG,

  caseStatusFilter: 'all',
  setCaseStatusFilter: (status) => set({ caseStatusFilter: status }),
  specialtyFilter: 'all',
  setSpecialtyFilter: (specialty) => set({ specialtyFilter: specialty }),

  addMember: (member) => {
    const newMember: CouncilMember = {
      ...member,
      id: `member-${Date.now()}`,
      joinedAt: new Date(),
      casesReviewed: 0,
      opinionsIssued: 0,
      currentCasesCount: 0,
    };
    set((state) => ({
      members: [...state.members, newMember],
    }));
    get().persistToLocal();
  },

  updateMember: (memberId, updates) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, ...updates } : m
      ),
    }));
    get().persistToLocal();
  },

  deactivateMember: (memberId) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, status: 'inactive' as const } : m
      ),
    }));
    get().persistToLocal();
  },

  reactivateMember: (memberId) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, status: 'active' as const, availability: 'available' as const } : m
      ),
    }));
    get().persistToLocal();
  },

  createCase: (referenceId, referenceTitle, referenceType, summary, context, questions, category, createdBy, priority = 'normal') => {
    const newCase = createCouncilCase(
      referenceId, referenceTitle, referenceType, summary, context, questions, category, createdBy, priority, get().config
    );
    set((state) => ({
      cases: [newCase, ...state.cases],
    }));
    get().persistToLocal();
  },

  assignCase: (caseId, memberIds) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              assignedTo: memberIds,
              assignedAt: new Date(),
              status: 'assigned' as const,
            }
          : c
      ),
    }));
    get().persistToLocal();
  },

  submitOpinion: (caseId, memberId, memberName, position, opinion, reasoning, confidence, concerns, suggestions) => {
    const newOpinion: CouncilOpinion = {
      id: `opinion-${Date.now()}`,
      memberId,
      memberName,
      position,
      opinion,
      reasoning,
      confidence,
      concerns,
      suggestions,
      createdAt: new Date(),
      updatedAt: null,
      isFinal: false,
    };

    set((state) => {
      const updatedCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;

        const newOpinions = [...c.opinions.filter((o) => o.memberId !== memberId), newOpinion];
        const decision = calculateCouncilDecision(newOpinions, state.config);
        const quorumMet = isQuorumMet(newOpinions.length, state.config);

        return {
          ...c,
          opinions: newOpinions,
          status: quorumMet ? 'opinion_issued' as const : 'under_review' as const,
          recommendation: decision.recommendation,
          confidence: decision.confidence,
        };
      });

      return { cases: updatedCases };
    });
    get().persistToLocal();
  },

  closeCase: (caseId) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === caseId
          ? { ...c, status: 'closed' as const, closedAt: new Date() }
          : c
      ),
    }));
    get().persistToLocal();
  },

  updateConfig: (updates) => {
    set((state) => ({
      config: { ...state.config, ...updates },
    }));
  },

  getActiveMembers: () => {
    return get().members.filter((m) => m.status === 'active');
  },

  getAvailableMembers: () => {
    const { members, config } = get();
    return members.filter((m) =>
      m.status === 'active' &&
      m.availability !== 'unavailable' &&
      m.currentCasesCount < m.maxCasesPerMonth &&
      m.currentCasesCount < config.maxActiveCasesPerMember
    );
  },

  getCaseById: (caseId) => {
    return get().cases.find((c) => c.id === caseId);
  },

  getCasesForMember: (memberId) => {
    return get().cases.filter((c) => c.assignedTo.includes(memberId));
  },

  getPendingCases: () => {
    return get().cases.filter((c) =>
      ['pending_assignment', 'assigned', 'under_review'].includes(c.status)
    );
  },

  getActiveCases: () => {
    return get().cases.filter((c) => c.status !== 'closed' && c.status !== 'expired');
  },

  getCaseOpinions: (caseId) => {
    const caseItem = get().cases.find((c) => c.id === caseId);
    return caseItem?.opinions || [];
  },

  suggestMembers: (requiredSpecialties) => {
    return suggestMembersForCase(get().members, requiredSpecialties, get().config);
  },

  getOverallStats: () => {
    const { members, cases } = get();
    const activeMembers = members.filter((m) => m.status === 'active');
    const pendingCases = cases.filter((c) =>
      ['pending_assignment', 'assigned', 'under_review'].includes(c.status)
    );

    // Calculate avg resolution time from closed cases
    const closedCases = cases.filter((c) => c.closedAt);
    let avgResolutionTime = 0;
    if (closedCases.length > 0) {
      const totalTime = closedCases.reduce((sum, c) => {
        const diff = new Date(c.closedAt!).getTime() - new Date(c.createdAt).getTime();
        return sum + diff / (1000 * 60 * 60); // hours
      }, 0);
      avgResolutionTime = Math.round((totalTime / closedCases.length) * 10) / 10;
    }

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalCases: cases.length,
      pendingCases: pendingCases.length,
      avgResolutionTime,
    };
  },

  // Supabase integration
  loadFromSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // Load council members
      const { data: membersData, error: membersError } = await supabase
        .from('council_members')
        .select('*')
        .eq('status', 'active');

      if (!membersError && membersData) {
        const loadedMembers: CouncilMember[] = membersData.map((db: DbCouncilMember) => ({
          id: db.id,
          name: db.name,
          title: db.title || '',
          organization: db.organization || '',
          email: db.email || '',
          role: db.role as CouncilMember['role'],
          specialties: (db.specialties || []) as CouncilMember['specialties'],
          status: db.status as CouncilMember['status'],
          joinedAt: new Date(db.joined_at),
          lastActiveAt: new Date(),
          casesReviewed: 0,
          opinionsIssued: 0,
          avatar: undefined,
          bio: '',
          availability: 'available',
          maxCasesPerMonth: db.max_cases_per_month || 5,
          currentCasesCount: 0,
        }));
        if (loadedMembers.length > 0) {
          set({ members: loadedMembers });
        }
      }

      // Load council cases
      const { data: casesData, error: casesError } = await supabase
        .from('council_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!casesError && casesData) {
        const loadedCases: CouncilCase[] = casesData.map((db: DbCouncilCase) => ({
          id: db.id,
          referenceId: db.reference_id || '',
          referenceTitle: db.reference_title || '',
          referenceType: db.reference_type as CouncilCase['referenceType'] || 'approval',
          status: (db.status?.replace('_', '') as CouncilCaseStatus) || 'pending_assignment',
          priority: db.priority as CouncilCase['priority'] || 'normal',
          category: (db.category || []) as CouncilSpecialty[],
          assignedTo: db.assigned_to || [],
          assignedAt: null,
          deadline: db.deadline ? new Date(db.deadline) : null,
          summary: db.summary || '',
          context: db.context || '',
          questions: db.questions || [],
          relevantDocuments: [],
          opinions: [],
          finalOpinion: db.recommendation || null,
          recommendation: (db.recommendation as CouncilCase['recommendation']) || 'no_action',
          confidence: db.confidence || 0,
          createdAt: new Date(db.created_at),
          closedAt: null,
          createdBy: db.created_by || '',
          tags: [],
          requiresUnanimousDecision: false,
          votingDeadline: null,
        }));
        if (loadedCases.length > 0) {
          set({ cases: loadedCases });
        }
      }
    } catch (error) {
      console.error('Failed to load council data from Supabase:', error);
    }
  },

  syncToSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { members, cases } = get();
    try {
      // Sync members
      for (const member of members) {
        await supabase.from('council_members').upsert({
          id: member.id,
          name: member.name,
          title: member.title,
          organization: member.organization,
          email: member.email,
          role: member.role,
          specialties: member.specialties,
          status: member.status,
          max_cases_per_month: member.maxCasesPerMonth,
        });
      }

      // Sync cases
      for (const c of cases) {
        await supabase.from('council_cases').upsert({
          id: c.id,
          reference_id: c.referenceId,
          reference_title: c.referenceTitle,
          reference_type: c.referenceType,
          status: c.status,
          priority: c.priority,
          category: c.category,
          assigned_to: c.assignedTo,
          summary: c.summary,
          context: c.context,
          questions: c.questions,
          recommendation: c.recommendation,
          confidence: c.confidence,
          created_by: c.createdBy,
          deadline: c.deadline?.toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to sync council data to Supabase:', error);
    }
  },

  // Local persistence
  initialize: async () => {
    try {
      const [localMembers, localCases] = await Promise.all([
        loadFromLocal<any>('councilMembers'),
        loadFromLocal<any>('councilCases'),
      ]);
      if (localMembers.length > 0) set({ members: localMembers });
      if (localCases.length > 0) set({ cases: localCases });
    } catch (error) {
      console.error('Failed to initialize council store from local storage:', error);
    }
  },

  persistToLocal: async () => {
    const { members, cases } = get();
    await Promise.all([
      saveToLocal('councilMembers', members),
      saveToLocal('councilCases', cases),
    ]);
  },
}));

// Re-export utilities
export {
  COUNCIL_SPECIALTY_LABELS,
  COUNCIL_ROLE_LABELS,
  COUNCIL_STATUS_LABELS,
};
export type { CouncilMember, CouncilCase, CouncilOpinion, CouncilSpecialty, CouncilCaseStatus };
