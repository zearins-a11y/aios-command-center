import { create } from 'zustand';
import {
  ConfidenceThreshold,
  ValidationType,
  ValidationResult,
  DEFAULT_THRESHOLDS,
  evaluateAgainstThresholds,
  calculateCombinedConfidence,
  getAggregatedDecision,
} from '../utils/confidenceThresholds';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ThresholdStore {
  thresholds: Record<ValidationType, ConfidenceThreshold>;

  // Threshold management
  updateThreshold: (type: ValidationType, updates: Partial<ConfidenceThreshold>) => void;
  toggleThreshold: (type: ValidationType) => void;
  resetToDefaults: () => void;

  // Validation
  evaluateValidation: (result: ValidationResult) => ReturnType<typeof evaluateAgainstThresholds>;
  evaluateMultipleValidations: (results: ValidationResult[]) => {
    combined: number;
    decision: ReturnType<typeof getAggregatedDecision>;
    evaluations: ReturnType<typeof evaluateAgainstThresholds>[];
  };

  // History (for analytics)
  validationHistory: Array<{
    id: string;
    timestamp: Date;
    results: ValidationResult[];
    decision: ReturnType<typeof getAggregatedDecision>;
    combinedConfidence: number;
  }>;
  recordValidation: (results: ValidationResult[]) => void;

  // Supabase integration
  loadFromSupabase: () => Promise<void>;
  syncToSupabase: () => Promise<void>;

  // Local IndexedDB persistence
  initialize: () => Promise<void>;
  persistToLocal: () => Promise<void>;
}

export const useThresholdStore = create<ThresholdStore>((set, get) => ({
  thresholds: { ...DEFAULT_THRESHOLDS },

  updateThreshold: (type, updates) => {
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        [type]: { ...state.thresholds[type], ...updates },
      },
    }));
  },

  toggleThreshold: (type) =>
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        [type]: { ...state.thresholds[type], enabled: !state.thresholds[type].enabled },
      },
    })),

  resetToDefaults: () => {
    set({ thresholds: { ...DEFAULT_THRESHOLDS } });
  },

  evaluateValidation: (result) => {
    const threshold = get().thresholds[result.type];
    return evaluateAgainstThresholds(result, threshold);
  },

  evaluateMultipleValidations: (results) => {
    const thresholds = get().thresholds;
    const evaluations = results.map((r) => evaluateAgainstThresholds(r, thresholds[r.type]));
    const combined = calculateCombinedConfidence(
      results.filter((r) => thresholds[r.type].enabled)
    );
    const decision = getAggregatedDecision(results);

    return { combined, decision, evaluations };
  },

  validationHistory: [
    // Mock history for demo
    {
      id: 'hist-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      results: [
        { type: 'compliance', confidence: 96, issues: [] },
        { type: 'facts', confidence: 89, issues: ['Verificar fonte da estatística'] },
        { type: 'format', confidence: 98, issues: [] },
      ],
      decision: 'requires_human' as const,
      combinedConfidence: 93,
    },
    {
      id: 'hist-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      results: [
        { type: 'compliance', confidence: 98, issues: [] },
        { type: 'facts', confidence: 94, issues: [] },
        { type: 'format', confidence: 100, issues: [] },
      ],
      decision: 'auto_approved' as const,
      combinedConfidence: 96,
    },
  ],

  recordValidation: (results) => {
    const { evaluateMultipleValidations } = get();
    const { combined, decision } = evaluateMultipleValidations(results);

    set((state) => ({
      validationHistory: [
        {
          id: `hist-${Date.now()}`,
          timestamp: new Date(),
          results,
          decision,
          combinedConfidence: combined,
        },
        ...state.validationHistory,
      ].slice(0, 50),
    }));

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('validation_history').insert({
        id: `hist-${Date.now()}`,
        results: results,
        decision: decision,
        combined_confidence: combined,
      });
    }
  },

  loadFromSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // Load thresholds
      const { data: thresholdData } = await supabase
        .from('confidence_thresholds')
        .select('*');

      if (thresholdData && thresholdData.length > 0) {
        const loadedThresholds = { ...DEFAULT_THRESHOLDS };
        thresholdData.forEach((db) => {
          const type = db.id as ValidationType;
          if (type in loadedThresholds) {
            loadedThresholds[type] = {
              ...loadedThresholds[type],
              enabled: db.enabled ?? true,
              autoApproveAbove: db.min_confidence ?? 70,
              autoBlockBelow: db.critical_threshold ?? 50,
            };
          }
        });
        set({ thresholds: loadedThresholds });
      }

      // Load validation history
      const { data: historyData } = await supabase
        .from('validation_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (historyData && historyData.length > 0) {
        const loadedHistory = historyData.map((db) => ({
          id: db.id,
          timestamp: new Date(db.timestamp),
          results: db.results as ValidationResult[],
          decision: db.decision as ReturnType<typeof getAggregatedDecision>,
          combinedConfidence: db.combined_confidence || 0,
        }));
        set({ validationHistory: loadedHistory });
      }
    } catch (error) {
      console.error('Failed to load threshold data from Supabase:', error);
    }
  },

  syncToSupabase: async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const { thresholds, validationHistory } = get();
    try {
      // Sync thresholds
      for (const [type, threshold] of Object.entries(thresholds)) {
        await supabase.from('confidence_thresholds').upsert({
          id: type,
          enabled: threshold.enabled,
          min_confidence: threshold.autoApproveAbove,
          critical_threshold: threshold.autoBlockBelow,
        });
      }

      // Sync validation history (only recent ones)
      for (const record of validationHistory.slice(0, 10)) {
        await supabase.from('validation_history').upsert({
          id: record.id,
          results: record.results,
          decision: record.decision,
          combined_confidence: record.combinedConfidence,
          timestamp: record.timestamp.toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to sync threshold data to Supabase:', error);
    }
  },

  initialize: async () => {
    // Thresholds are simple config, keep defaults
  },

  persistToLocal: async () => {
    // Thresholds don't need local persistence
  },
}));
