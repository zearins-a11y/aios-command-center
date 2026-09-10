import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Info, TrendingUp, CheckCircle2, User, XCircle } from 'lucide-react';
import { ThresholdConfigPanel } from '../components/governance/ThresholdConfigPanel';

export const ThresholdSystem: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6366f1] flex items-center justify-center">
                <BrainCircuit size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Confidence Thresholds
                </h1>
                <p className="text-sm text-text-muted">
                  Sistema de limiares ajustáveis por tipo de validação IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-6 p-4 bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[#6366f1] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-1">
              Como funciona o sistema de thresholds
            </p>
            <p>
              Cada tipo de validação tem três zonas configuráveis:
            </p>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs">Auto-aprovar (acima)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-xs">Requer humano (entre)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs">Auto-bloquear (abaixo)</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-card border border-border-default rounded-xl p-6"
        >
          <ThresholdConfigPanel />
        </motion.div>

        {/* Quick Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#a855f7]" />
            Tipos de Validação
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ValidationTypeCard
              icon="🛡️"
              name="Compliance"
              description="Conformidade legal (LGPD, GDPR)"
              color="#22c55e"
            />
            <ValidationTypeCard
              icon="✓"
              name="Factualidade"
              description="Veracidade das informações"
              color="#22c55e"
            />
            <ValidationTypeCard
              icon="📝"
              name="Formato"
              description="Gramática, ortografia, estrutura"
              color="#6366f1"
            />
            <ValidationTypeCard
              icon="♿"
              name="Acessibilidade"
              description="Alt text, contraste, leitura"
              color="#06b6d4"
            />
            <ValidationTypeCard
              icon="🎯"
              name="Voz da Marca"
              description="Tom, vocabulário, personalidade"
              color="#f59e0b"
            />
            <ValidationTypeCard
              icon="⚖️"
              name="Risco Legal"
              description="Problemas jurídicos ou regulatórios"
              color="#ef4444"
            />
            <ValidationTypeCard
              icon="🎭"
              name="Tom"
              description="Adequação ao contexto e audiência"
              color="#ec4899"
            />
            <ValidationTypeCard
              icon="📊"
              name="Engajamento"
              description="Potencial de interação (desabilitado)"
              color="#64748b"
              disabled
            />
          </div>
        </motion.div>

        {/* Decision Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Fluxo de Decisão
          </h3>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <FlowStep
              icon={<CheckCircle2 size={14} />}
              label="Auto-aprovado"
              color="#22c55e"
              description="≥ autoApproveAbove"
            />
            <Arrow />
            <FlowStep
              icon={<User size={14} />}
              label="Requer Humano"
              color="#fbbf24"
              description="entre range"
            />
            <Arrow />
            <FlowStep
              icon={<XCircle size={14} />}
              label="Auto-bloqueado"
              color="#ef4444"
              description="≤ autoBlockBelow"
            />
          </div>
          <p className="text-xs text-text-dim text-center mt-4">
            Decisão agregada: se qualquer validação requer humano → requer humano | se qualquer é bloqueada → bloqueada
          </p>
        </motion.div>
      </div>
    </div>
  );
};

interface ValidationTypeCardProps {
  icon: string;
  name: string;
  description: string;
  color: string;
  disabled?: boolean;
}

function ValidationTypeCard({ icon, name, description, color, disabled }: ValidationTypeCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        disabled ? 'opacity-50 border-border-default/30' : 'border-border-default'
      }`}
      style={{
        backgroundColor: disabled ? undefined : `${color}08`,
        borderColor: disabled ? undefined : `${color}30`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span
          className="text-sm font-semibold"
          style={{ color: disabled ? '#64748b' : color }}
        >
          {name}
        </span>
      </div>
      <p className="text-xs text-text-muted">{description}</p>
    </div>
  );
}

interface FlowStepProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  description: string;
}

function FlowStep({ icon, label, color, description }: FlowStepProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-text-primary">{label}</span>
      <span className="text-xs text-text-dim">{description}</span>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-dim">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
