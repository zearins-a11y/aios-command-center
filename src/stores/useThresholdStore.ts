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
}

export const useThresholdStore = create<ThresholdStore>((set, get) => ({
  thresholds: { ...DEFAULT_THRESHOLDS },

  updateThreshold: (type, updates) =>
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        [type]: { ...state.thresholds[type], ...updates },
      },
    })),

  toggleThreshold: (type) =>
    set((state) => ({
      thresholds: {
        ...state.thresholds,
        [type]: { ...state.thresholds[type], enabled: !state.thresholds[type].enabled },
      },
    })),

  resetToDefaults: () => set({ thresholds: { ...DEFAULT_THRESHOLDS } }),

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
  },
}));
