import { create } from 'zustand';
import {
  FeedbackSignal,
  FeedbackLoopConfig,
  FeedbackPattern,
  FeedbackDecision,
  FeedbackPatternStats,
  AgentFeedbackSummary,
  DEFAULT_FEEDBACK_CONFIG,
  FEEDBACK_PATTERN_LABELS,
  FEEDBACK_PATTERN_DESCRIPTIONS,
  FEEDBACK_PATTERN_ICONS,
  FEEDBACK_DECISION_LABELS,
  getPatternStats,
  generateAgentFeedbackSummary,
  createFeedbackSignal,
  getAvailablePatterns,
} from '../utils/feedbackLoop';
import { AgentRole } from '../types/governance';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FeedbackSignal as DbFeedbackSignal } from '../lib/types';

interface FeedbackLoopStore {
  // Feedback signals
  feedbackSignals: FeedbackSignal[];

  // Configuration
  config: FeedbackLoopConfig;

  // Filters
  patternFilter: FeedbackPattern | 'all';
  setPatternFilter: (pattern: FeedbackPattern | 'all') => void;
  agentFilter: AgentRole | 'all';
  setAgentFilter: (agent: AgentRole | 'all') => void;
  decisionFilter: FeedbackDecision | 'all';
  setDecisionFilter: (decision: FeedbackDecision | 'all') => void;

  // Actions
  addFeedbackSignal: (
    itemId: string,
    itemTitle: string,
    itemType: FeedbackSignal['itemType'],
    decision: FeedbackDecision,
    agentId: AgentRole,
    agentName: string,
    squadId: string,
    reviewerId: string,
    reviewerName: string,
    pattern: FeedbackPattern,
    reason: string,
    options?: {
      originalContent?: string;
      modifiedContent?: string;
      changeDescription?: string;
    }
  ) => void;

  acknowledgeFeedback: (feedbackId: string) => void;
  updateConfig: (updates: Partial<FeedbackLoopConfig>) => void;

  // Queries
  getFeedbackForAgent: (agentId: AgentRole) => FeedbackSignal[];
  getFeedbackForItem: (itemId: string) => FeedbackSignal[];
  getAgentSummary: (agentId: AgentRole, agentName: string) => AgentFeedbackSummary;
  getAllAgentSummaries: () => AgentFeedbackSummary[];
  getPatternStatistics: (windowDays?: number) => FeedbackPatternStats[];
  getRecentFeedback: (limit?: number) => FeedbackSignal[];
  getFilteredFeedback: () => FeedbackSignal[];
  getOverallStats: () => {
    totalFeedback: number;
    approvalRate: number;
    modificationRate: number;
    rejectionRate: number;
    avgResponseTime: number;
  };
}

export const useFeedbackLoopStore = create<FeedbackLoopStore>((set, get) => ({
  feedbackSignals: [
    // Mock feedback signals
    {
      id: 'fb-1',
      itemId: 'post-1',
      itemTitle: 'Post sobre nova funcionalidade',
      itemType: 'post',
      decision: 'approved',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      agentId: 'aios_dev',
      agentName: 'AIOS Dev',
      squadId: 'aios',
      reviewerId: 'strategist',
      reviewerName: 'Strategist',
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      pattern: 'format_error',
      patternConfidence: 78,
      reason: 'Pequeno erro de formatação na lista de features.',
      wasPublished: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60),
      agentAcknowledged: true,
      agentAcknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: 'fb-2',
      itemId: 'post-2',
      itemTitle: 'Artigo sobre cultura empresa',
      itemType: 'article',
      decision: 'modified',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      agentId: 'copy_squad',
      agentName: 'Copy Writer',
      squadId: 'copy',
      reviewerId: 'brand_guardian',
      reviewerName: 'Brand Guardian',
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      originalContent: 'Somos a empresa mais inovadora do Brasil...',
      modifiedContent: 'Nossa equipe está liderando inovações no setor...',
      changeDescription: 'Removido superlativo não verificável',
      pattern: 'tone_issues',
      patternConfidence: 92,
      reason: 'Tom muito assertivo sem evidência. Ajustado para tom mais equilibrado.',
      wasPublished: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
      agentAcknowledged: true,
      agentAcknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
    {
      id: 'fb-3',
      itemId: 'post-3',
      itemTitle: 'Thread sobre parcerias',
      itemType: 'post',
      decision: 'rejected',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12h ago
      agentId: 'aios_dev',
      agentName: 'AIOS Dev',
      squadId: 'aios',
      reviewerId: 'legal_compliance',
      reviewerName: 'Legal Compliance',
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 11),
      pattern: 'compliance_issue',
      patternConfidence: 95,
      reason: 'Menciona parceria não anunciada oficialmente. Aguardar release.',
      wasPublished: false,
      publishedAt: null,
      agentAcknowledged: false,
      agentAcknowledgedAt: null,
      improvementSuggestion: 'Verificar lista de parcerias aprovadas antes de mencionar.',
    },
    {
      id: 'fb-4',
      itemId: 'post-4',
      itemTitle: 'Post sobre métricas Q3',
      itemType: 'post',
      decision: 'approved',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6h ago
      agentId: 'data_squad',
      agentName: 'Data Analyst',
      squadId: 'data',
      reviewerId: 'strategist',
      reviewerName: 'Strategist',
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      pattern: 'accessibility_missing',
      patternConfidence: 65,
      reason: 'Faltou alt text em uma imagem. Corrigido na publicação.',
      wasPublished: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      agentAcknowledged: true,
      agentAcknowledgedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: 'fb-5',
      itemId: 'post-5',
      itemTitle: 'Resposta a comentário',
      itemType: 'reply',
      decision: 'approved',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      agentId: 'copy_squad',
      agentName: 'Copy Writer',
      squadId: 'copy',
      reviewerId: 'brand_guardian',
      reviewerName: 'Brand Guardian',
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
      pattern: 'context_missing',
      patternConfidence: 72,
      reason: 'Resposta perfeita, mas faltou contexto adicional sobre o produto.',
      wasPublished: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60),
      agentAcknowledged: true,
      agentAcknowledgedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ],

  config: DEFAULT_FEEDBACK_CONFIG,

  patternFilter: 'all',
  setPatternFilter: (pattern) => set({ patternFilter: pattern }),
  agentFilter: 'all',
  setAgentFilter: (agent) => set({ agentFilter: agent }),
  decisionFilter: 'all',
  setDecisionFilter: (decision) => set({ decisionFilter: decision }),

  addFeedbackSignal: (itemId, itemTitle, itemType, decision, agentId, agentName, squadId, reviewerId, reviewerName, pattern, reason, options) => {
    const signal = createFeedbackSignal(
      itemId, itemTitle, itemType, decision, agentId, agentName, squadId,
      reviewerId, reviewerName, pattern, reason, options
    );
    set((state) => ({
      feedbackSignals: [signal, ...state.feedbackSignals],
    }));
  },

  acknowledgeFeedback: (feedbackId) => {
    set((state) => ({
      feedbackSignals: state.feedbackSignals.map((fb) =>
        fb.id === feedbackId
          ? { ...fb, agentAcknowledged: true, agentAcknowledgedAt: new Date() }
          : fb
      ),
    }));
  },

  updateConfig: (updates) => {
    set((state) => ({
      config: { ...state.config, ...updates },
    }));
  },

  getFeedbackForAgent: (agentId) => {
    return get().feedbackSignals.filter((fb) => fb.agentId === agentId);
  },

  getFeedbackForItem: (itemId) => {
    return get().feedbackSignals.filter((fb) => fb.itemId === itemId);
  },

  getAgentSummary: (agentId, agentName) => {
    const feedback = get().feedbackSignals.filter((fb) => fb.agentId === agentId);
    return generateAgentFeedbackSummary(agentId, agentName, feedback, get().config);
  },

  getAllAgentSummaries: () => {
    const { feedbackSignals, config } = get();
    const agentMap = new Map<string, { id: AgentRole; name: string; feedback: FeedbackSignal[] }>();

    feedbackSignals.forEach((fb) => {
      if (!agentMap.has(fb.agentId)) {
        agentMap.set(fb.agentId, { id: fb.agentId, name: fb.agentName, feedback: [] });
      }
      agentMap.get(fb.agentId)!.feedback.push(fb);
    });

    return Array.from(agentMap.values()).map((agent) =>
      generateAgentFeedbackSummary(agent.id, agent.name, agent.feedback, config)
    );
  },

  getPatternStatistics: (windowDays = 30) => {
    return getPatternStats(get().feedbackSignals, windowDays);
  },

  getRecentFeedback: (limit = 10) => {
    return get()
      .feedbackSignals.slice()
      .sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())
      .slice(0, limit);
  },

  getFilteredFeedback: () => {
    const { feedbackSignals, patternFilter, agentFilter, decisionFilter } = get();
    return feedbackSignals.filter((fb) => {
      if (patternFilter !== 'all' && fb.pattern !== patternFilter) return false;
      if (agentFilter !== 'all' && fb.agentId !== agentFilter) return false;
      if (decisionFilter !== 'all' && fb.decision !== decisionFilter) return false;
      return true;
    });
  },

  getOverallStats: () => {
    const feedback = get().feedbackSignals;
    if (feedback.length === 0) {
      return {
        totalFeedback: 0,
        approvalRate: 100,
        modificationRate: 0,
        rejectionRate: 0,
        avgResponseTime: 0,
      };
    }

    const approved = feedback.filter((f) => f.decision === 'approved').length;
    const modified = feedback.filter((f) => f.decision === 'modified').length;
    const rejected = feedback.filter((f) => f.decision === 'rejected').length;

    // Calculate avg response time
    const totalTime = feedback.reduce((sum, f) => {
      const diff = new Date(f.reviewedAt).getTime() - new Date(f.submittedAt).getTime();
      return sum + diff / (1000 * 60 * 60); // hours
    }, 0);
    const avgResponseTime = Math.round((totalTime / feedback.length) * 10) / 10;

    return {
      totalFeedback: feedback.length,
      approvalRate: Math.round((approved / feedback.length) * 100),
      modificationRate: Math.round((modified / feedback.length) * 100),
      rejectionRate: Math.round((rejected / feedback.length) * 100),
      avgResponseTime,
    };
  },

  // Supabase integration
  loadFromSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('feedback_signals')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const signals: FeedbackSignal[] = data.map((db: DbFeedbackSignal) => ({
          id: db.id,
          itemId: db.item_id || '',
          itemTitle: db.item_title || '',
          itemType: (db.item_type as FeedbackSignal['itemType']) || 'post',
          decision: (db.decision as FeedbackDecision) || 'approved',
          submittedAt: new Date(db.created_at),
          agentId: (db.agent_id || 'aios_dev') as AgentRole,
          agentName: db.agent_name || '',
          squadId: db.squad_id || '',
          reviewerId: db.reviewer_id || '',
          reviewerName: db.reviewer_name || '',
          reviewedAt: new Date(db.created_at),
          pattern: (db.pattern as FeedbackPattern) || 'format_error',
          patternConfidence: db.pattern_confidence || 0,
          reason: db.reason || '',
          wasPublished: db.was_published || false,
          publishedAt: null,
          agentAcknowledged: db.agent_acknowledged || false,
          agentAcknowledgedAt: db.agent_acknowledged_at ? new Date(db.agent_acknowledged_at) : null,
        }));
        set({ feedbackSignals: signals.length > 0 ? signals : get().feedbackSignals });
      }
    } catch (error) {
      console.error('Failed to load feedback from Supabase:', error);
    }
  },

  syncToSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { feedbackSignals } = get();
    try {
      for (const signal of feedbackSignals) {
        await supabase.from('feedback_signals').upsert({
          id: signal.id,
          item_id: signal.itemId,
          item_title: signal.itemTitle,
          item_type: signal.itemType,
          decision: signal.decision,
          agent_id: signal.agentId,
          agent_name: signal.agentName,
          squad_id: signal.squadId,
          reviewer_id: signal.reviewerId,
          reviewer_name: signal.reviewerName,
          pattern: signal.pattern,
          pattern_confidence: signal.patternConfidence,
          reason: signal.reason,
          was_published: signal.wasPublished,
          agent_acknowledged: signal.agentAcknowledged,
          agent_acknowledged_at: signal.agentAcknowledgedAt?.toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to sync feedback to Supabase:', error);
    }
  },
}));

// Re-export utils
export {
  FEEDBACK_PATTERN_LABELS,
  FEEDBACK_PATTERN_DESCRIPTIONS,
  FEEDBACK_PATTERN_ICONS,
  FEEDBACK_DECISION_LABELS,
  getAvailablePatterns,
};
export type { FeedbackSignal, FeedbackPattern, FeedbackDecision, FeedbackPatternStats };
