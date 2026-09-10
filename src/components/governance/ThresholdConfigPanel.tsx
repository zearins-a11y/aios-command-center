import { motion } from 'framer-motion';
import {
  Power,
  RotateCcw,
  CheckCircle2,
  User,
  XCircle,
} from 'lucide-react';
import { useThresholdStore } from '../../stores/useThresholdStore';
import {
  ValidationType,
  DEFAULT_THRESHOLDS,
  getDecisionColor,
  getDecisionLabel,
  getDecisionIcon,
} from '../../utils/confidenceThresholds';

interface ThresholdRowProps {
  type: ValidationType;
  threshold: {
    autoApproveAbove: number;
    requireHumanBetween: [number, number];
    autoBlockBelow: number;
    enabled: boolean;
  };
}

function ThresholdRow({ type, threshold }: ThresholdRowProps) {
  const updateThreshold = useThresholdStore((s) => s.updateThreshold);
  const toggleThreshold = useThresholdStore((s) => s.toggleThreshold);

  const config = DEFAULT_THRESHOLDS[type];
  const [_, humanMin] = threshold.requireHumanBetween;

  return (
    <motion.div
      layout
      className={`p-4 rounded-xl border transition-colors ${
        threshold.enabled
          ? 'bg-bg-card border-border-default'
          : 'bg-bg-card/50 border-border-default/30 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center text-lg">
            {config.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">
              {config.label}
            </div>
            <div className="text-xs text-text-muted">{config.description}</div>
          </div>
        </div>

        <button
          onClick={() => toggleThreshold(type)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            threshold.enabled ? 'bg-[#22c55e]' : 'bg-bg-secondary'
          }`}
          title={threshold.enabled ? 'Desativar' : 'Ativar'}
        >
          <Power
            size={10}
            className={`absolute top-1/2 -translate-y-1/2 transition-transform text-white ${
              threshold.enabled ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Threshold Sliders */}
      <div className="space-y-3">
        {/* Auto Approve Above */}
        <ThresholdSlider
          label="Auto-aprovar acima de"
          value={threshold.autoApproveAbove}
          min={50}
          max={100}
          color="#22c55e"
          onChange={(value) => {
            // Ensure autoApproveAbove > autoBlockBelow + 5
            const newValue = Math.max(value, threshold.autoBlockBelow + 5);
            updateThreshold(type, { autoApproveAbove: newValue });
          }}
          disabled={!threshold.enabled}
        />

        {/* Human Range Min */}
        <ThresholdSlider
          label="Human review mínimo"
          value={humanMin}
          min={threshold.autoBlockBelow + 1}
          max={threshold.autoApproveAbove - 1}
          color="#fbbf24"
          onChange={(value) => {
            const [_, max] = threshold.requireHumanBetween;
            updateThreshold(type, {
              requireHumanBetween: [value, max],
            });
          }}
          disabled={!threshold.enabled}
        />

        {/* Auto Block Below */}
        <ThresholdSlider
          label="Auto-bloquear abaixo de"
          value={threshold.autoBlockBelow}
          min={0}
          max={humanMin - 1}
          color="#ef4444"
          onChange={(value) => {
            // Ensure autoBlockBelow < humanMin - 1
            const newValue = Math.min(value, humanMin - 1);
            updateThreshold(type, { autoBlockBelow: newValue });
          }}
          disabled={!threshold.enabled}
        />
      </div>

      {/* Visual Range Bar */}
      <div className="mt-4 relative h-2 bg-bg-secondary rounded-full overflow-hidden">
        {/* Auto Block Zone */}
        <div
          className="absolute inset-y-0 left-0 bg-red-500/40"
          style={{ width: `${threshold.autoBlockBelow}%` }}
        />
        {/* Human Review Zone */}
        <div
          className="absolute inset-y-0 bg-yellow-500/40"
          style={{
            left: `${threshold.autoBlockBelow}%`,
            width: `${threshold.autoApproveAbove - threshold.autoBlockBelow}%`,
          }}
        />
        {/* Auto Approve Zone */}
        <div
          className="absolute inset-y-0 right-0 bg-green-500/40"
          style={{ width: `${100 - threshold.autoApproveAbove}%` }}
        />
      </div>

      {/* Range Labels */}
      <div className="mt-2 flex items-center justify-between text-xs text-text-dim">
        <span>0</span>
        <span>{threshold.autoBlockBelow}</span>
        <span>{humanMin}</span>
        <span>{threshold.autoApproveAbove}</span>
        <span>100</span>
      </div>
    </motion.div>
  );
}

interface ThresholdSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function ThresholdSlider({
  label,
  value,
  min,
  max,
  color,
  onChange,
  disabled,
}: ThresholdSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-muted">{label}</span>
        <span
          className="text-sm font-bold"
          style={{ color: disabled ? '#64748b' : color }}
        >
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${
            ((value - min) / (max - min)) * 100
          }%, #2d2d44 ${
            ((value - min) / (max - min)) * 100
          }%, #2d2d44 100%)`,
        }}
      />
    </div>
  );
}

export function ThresholdConfigPanel() {
  const { thresholds, resetToDefaults, validationHistory } = useThresholdStore();

  const enabledCount = Object.values(thresholds).filter((t) => t.enabled).length;
  const totalCount = Object.keys(thresholds).length;

  // Statistics
  const stats = {
    autoApproved: validationHistory.filter((h) => h.decision === 'auto_approved').length,
    requiresHuman: validationHistory.filter((h) => h.decision === 'requires_human').length,
    autoBlocked: validationHistory.filter((h) => h.decision === 'auto_blocked').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Confidence Thresholds
          </h3>
          <p className="text-xs text-text-muted mt-1">
            P0 - Thresholds ajustáveis por tipo de validação
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {enabledCount}/{totalCount} ativos
          </span>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-bg-card border border-border-default rounded hover:border-[#6366f1] transition-colors"
          >
            <RotateCcw size={12} />
            Restaurar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<CheckCircle2 size={16} />}
          label="Auto-aprovados"
          value={stats.autoApproved}
          color="#22c55e"
          bgColor="rgba(34, 197, 94, 0.1)"
        />
        <StatCard
          icon={<User size={16} />}
          label="Requer Humano"
          value={stats.requiresHuman}
          color="#fbbf24"
          bgColor="rgba(251, 191, 36, 0.1)"
        />
        <StatCard
          icon={<XCircle size={16} />}
          label="Auto-bloqueados"
          value={stats.autoBlocked}
          color="#ef4444"
          bgColor="rgba(239, 68, 68, 0.1)"
        />
      </div>

      {/* Threshold Configurations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {(Object.keys(thresholds) as ValidationType[]).map((type) => (
          <ThresholdRow key={type} type={type} threshold={thresholds[type]} />
        ))}
      </div>

      {/* Recent History */}
      {validationHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            Histórico de Decisões
          </h4>
          <div className="space-y-2">
            {validationHistory.slice(0, 10).map((entry) => {
              const color = getDecisionColor(entry.decision);
              const label = getDecisionLabel(entry.decision);
              const icon = getDecisionIcon(entry.decision);

              return (
                <div
                  key={entry.id}
                  className="p-3 bg-bg-card border border-border-default rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span className="text-sm font-semibold" style={{ color }}>
                        {label}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({entry.combinedConfidence}% combined)
                      </span>
                    </div>
                    <span className="text-xs text-text-dim">
                      {new Date(entry.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {entry.results.map((r, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-bg-secondary rounded text-text-muted"
                      >
                        {DEFAULT_THRESHOLDS[r.type].label}: {r.confidence}%
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div
      className="p-3 rounded-xl border"
      style={{
        backgroundColor: bgColor,
        borderColor: `${color}40`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div style={{ color }}>{icon}</div>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
