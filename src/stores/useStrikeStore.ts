import { create } from 'zustand';
import {
  StrikeRecord,
  StrikeLevel,
  DEFAULT_STRIKE_CONFIG,
  getStrikeLevel,
  countRecentViolations,
  shouldAutoReset,
  shouldAutoPause,
  needsHumanReview,
  getDaysSinceLastViolation,
} from '../utils/strikeSystem';
import { AgentRole, AgentWorkStatus } from '../types/governance';

interface StrikeStore {
  strikes: StrikeRecord[];
  config: typeof DEFAULT_STRIKE_CONFIG;

  // CRUD
  addStrike: (record: Omit<StrikeRecord, 'id' | 'timestamp'>) => StrikeRecord;
  resolveStrike: (id: string, resolvedBy: string, notes?: string) => void;
  clearStrikes: (agentId: AgentRole) => void;
  updateConfig: (config: Partial<typeof DEFAULT_STRIKE_CONFIG>) => void;

  // Queries
  getStrikeLevel: (agentId: AgentRole) => StrikeLevel;
  getStrikesForAgent: (agentId: AgentRole) => StrikeRecord[];
  getRecentStrikeCount: (agentId: AgentRole) => number;
  getDaysSinceLastViolation: (agentId: AgentRole) => number | null;
  shouldAutoPause: (agentId: AgentRole) => boolean;
  needsHumanReview: (agentId: AgentRole) => boolean;
  getRecommendedStatus: (agentId: AgentRole) => AgentWorkStatus;
  getAllStrikeSummaries: () => AgentStrikeSummary[];
}

export interface AgentStrikeSummary {
  agentId: AgentRole;
  agentName: string;
  level: StrikeLevel;
  recentStrikes: number;
  daysSinceLastViolation: number | null;
  shouldPause: boolean;
  needsReview: boolean;
  recommendedStatus: AgentWorkStatus;
  totalStrikes: number;
}

// Mock initial strikes to demonstrate the system
const seedStrikes: StrikeRecord[] = [
  {
    id: 'strike-1',
    agentId: 'copywriter',
    agentName: 'Redator',
    level: 'warning',
    reason: 'Conteúdo com tom inadequado detectado pelo Guardião',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    id: 'strike-2',
    agentId: 'copywriter',
    agentName: 'Redator',
    level: 'yellow',
    reason: 'Segunda violação - claims sem evidência',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
    notes: 'Requer revisão do prompt template',
  },
  {
    id: 'strike-3',
    agentId: 'strategy',
    agentName: 'Estrategista',
    level: 'warning',
    reason: 'Proposta fora do escopo do projeto',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    resolvedBy: 'Você',
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    notes: 'Falso positivo - proposta alinhada após discussão',
  },
];

export const useStrikeStore = create<StrikeStore>((set, get) => ({
  strikes: seedStrikes,
  config: DEFAULT_STRIKE_CONFIG,

  addStrike: (record) => {
    const newStrike: StrikeRecord = {
      ...record,
      id: `strike-${Date.now()}`,
      timestamp: new Date(),
    };

    set((state) => ({
      strikes: [newStrike, ...state.strikes],
    }));

    return newStrike;
  },

  resolveStrike: (id, resolvedBy, notes) =>
    set((state) => ({
      strikes: state.strikes.map((s) =>
        s.id === id ? { ...s, resolvedBy, resolvedAt: new Date(), notes: notes || s.notes } : s
      ),
    })),

  clearStrikes: (agentId) =>
    set((state) => ({
      strikes: state.strikes.filter((s) => s.agentId !== agentId),
    })),

  updateConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),

  getStrikeLevel: (agentId) => {
    const { strikes, config } = get();
    const count = countRecentViolations(strikes, agentId, config);
    return getStrikeLevel(count, config);
  },

  getStrikesForAgent: (agentId) => {
    return get().strikes.filter((s) => s.agentId === agentId);
  },

  getRecentStrikeCount: (agentId) => {
    const { strikes, config } = get();
    return countRecentViolations(strikes, agentId, config);
  },

  getDaysSinceLastViolation: (agentId) => {
    const { strikes } = get();
    return getDaysSinceLastViolation(strikes, agentId);
  },

  shouldAutoPause: (agentId) => {
    const level = get().getStrikeLevel(agentId);
    return shouldAutoPause(level);
  },

  needsHumanReview: (agentId) => {
    const level = get().getStrikeLevel(agentId);
    return needsHumanReview(level);
  },

  getRecommendedStatus: (agentId) => {
    const { strikes, config } = get();
    const count = countRecentViolations(strikes, agentId, config);

    // Auto-reset check
    if (shouldAutoReset(strikes, agentId, config)) {
      return 'idle';
    }

    const level = getStrikeLevel(count, config);
    if (level === 'suspended') return 'blocked';
    if (level === 'red' || level === 'yellow') return 'blocked';
    return 'idle';
  },

  getAllStrikeSummaries: () => {
    const { strikes } = get();
    const agentIds: AgentRole[] = ['strategy', 'copywriter', 'studio', 'guardian', 'operator', 'aios_dev', 'copy_squad', 'data_squad', 'legal_compliance', 'brand_guardian', 'advisory_board'];
    const agentNames: Record<AgentRole, string> = {
      strategy: 'Estrategista',
      copywriter: 'Redator',
      studio: 'Estúdio',
      guardian: 'Guardião',
      operator: 'Operador',
      aios_dev: 'AIOS Dev',
      copy_squad: 'Copy Squad',
      data_squad: 'Data Squad',
      legal_compliance: 'Legal Compliance',
      brand_guardian: 'Brand Guardian',
      advisory_board: 'Advisory Board',
    };

    return agentIds.map((agentId) => {
      const agentStrikes = strikes.filter((s) => s.agentId === agentId);
      const summary = {
        agentId,
        agentName: agentNames[agentId],
        level: get().getStrikeLevel(agentId),
        recentStrikes: get().getRecentStrikeCount(agentId),
        daysSinceLastViolation: get().getDaysSinceLastViolation(agentId),
        shouldPause: get().shouldAutoPause(agentId),
        needsReview: get().needsHumanReview(agentId),
        recommendedStatus: get().getRecommendedStatus(agentId),
        totalStrikes: agentStrikes.length,
      };
      return summary;
    });
  },
}));
