import React from 'react';
import { motion } from 'framer-motion';
import { Users, Info, CheckCircle2, XCircle, AlertTriangle, Minus, HelpCircle } from 'lucide-react';
import { CouncilPanel } from '../components/governance/CouncilPanel';

export const Council: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#a855f7] flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Conselho Consultivo
                </h1>
                <p className="text-sm text-text-muted">
                  Pool de revisores independentes para casos especiais
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
        className="mx-6 mt-6 p-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[#8b5cf6] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-1">
              Como funciona o Conselho Consultivo
            </p>
            <p>
              Casos especiais são escalados para um pool de revisores independentes que emitem
              pareceres não vinculantes. Útil para edge cases, disputas ou decisões de alto impacto.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <CheckCircle2 size={14} className="text-green-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Parecer</div>
                  <div className="text-xs text-text-muted">Não vinculante, advisory</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <AlertTriangle size={14} className="text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Independente</div>
                  <div className="text-xs text-text-muted">Membros externos à operação</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Users size={14} className="text-blue-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Diverse</div>
                  <div className="text-xs text-text-muted">Jurídico, marca, ética, PR</div>
                </div>
              </div>
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
          <CouncilPanel />
        </motion.div>

        {/* Role Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users size={16} className="text-[#8b5cf6]" />
            Tipos de Posição
          </h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <PositionType
              icon={<CheckCircle2 size={20} />}
              label="A Favor"
              color="#22c55e"
              description="Concorda com a aprovação"
            />
            <PositionType
              icon={<XCircle size={20} />}
              label="Contra"
              color="#ef4444"
              description="Discorda da aprovação"
            />
            <PositionType
              icon={<Minus size={20} />}
              label="Abstenção"
              color="#6b7280"
              description="Não se posiciona"
            />
            <PositionType
              icon={<HelpCircle size={20} />}
              label="Precisa Info"
              color="#f59e0b"
              description="Necessita mais informações"
            />
          </div>
        </motion.div>

        {/* Specialty Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Especialidades dos Membros
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <SpecialtyCard icon="⚖️" label="Jurídico" description="Direito digital, contratos" />
            <SpecialtyCard icon="🛡️" label="Compliance" description="LGPD, políticas internas" />
            <SpecialtyCard icon="🎨" label="Marca" description="Brand guidelines, tom" />
            <SpecialtyCard icon="📢" label="Marketing" description="Campanhas, estratégia" />
            <SpecialtyCard icon="💻" label="Técnico" description="Aspectos técnicos" />
            <SpecialtyCard icon="⚠️" label="Ética" description="Vieses, responsabilidade" />
            <SpecialtyCard icon="🗣️" label="Relações Públicas" description="Comunicação, crises" />
          </div>
        </motion.div>

        {/* When to Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Quando usar o Conselho
          </h3>
          <div className="space-y-3">
            <WhenToUseCard
              title="Casos Legais Ambíguos"
              description="Quando há incerteza sobre implicações legais de uma decisão."
            />
            <WhenToUseCard
              title="Decisões de Alto Impacto"
              description="Posts que podem afetar marca, stakeholders ou público."
            />
            <WhenToUseCard
              title="Recursos Controversos"
              description="Quando um recurso gera debate interno sem consenso."
            />
            <WhenToUseCard
              title="Edge Cases"
              description="Situações não previstas pelas políticas existentes."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface PositionTypeProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  description: string;
}

function PositionType({ icon, label, color, description }: PositionTypeProps) {
  return (
    <div
      className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl text-center"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <div style={{ color }}>{icon}</div>
      <span className="text-sm font-semibold" style={{ color }}>
        {label}
      </span>
      <span className="text-xs text-text-muted">{description}</span>
    </div>
  );
}

interface SpecialtyCardProps {
  icon: string;
  label: string;
  description: string;
}

function SpecialtyCard({ icon, label, description }: SpecialtyCardProps) {
  return (
    <div className="p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <p className="text-xs text-text-muted">{description}</p>
    </div>
  );
}

interface WhenToUseCardProps {
  title: string;
  description: string;
}

function WhenToUseCard({ title, description }: WhenToUseCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div className="w-2 h-2 rounded-full bg-[#8b5cf6] mt-2 flex-shrink-0" />
      <div>
        <div className="text-sm font-medium text-text-primary">{title}</div>
        <div className="text-xs text-text-muted mt-1">{description}</div>
      </div>
    </div>
  );
}
