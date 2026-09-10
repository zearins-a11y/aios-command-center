import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Info, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppealsPanel } from '../components/governance/AppealsPanel';

export const Appeals: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                <Scale size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Processo de Recursos
                </h1>
                <p className="text-sm text-text-muted">
                  Contestação formal de decisões de bloqueio ou rejeição
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
              Como funciona o processo de recursos
            </p>
            <p>
              Quando um item é bloqueado ou rejeitado, você pode contestar a decisão através de um recurso formal.
              O recurso será revisado por um revisor diferente do original, garantindo imparcialidade.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Clock size={14} className="text-blue-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">SLA de 48h</div>
                  <div className="text-xs text-text-muted">Decisão garantida em até 48 horas</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <CheckCircle2 size={14} className="text-green-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Revisor Imparcial</div>
                  <div className="text-xs text-text-muted">Nunca o mesmo que rejeitou originalmente</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <AlertTriangle size={14} className="text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Urgência Automática</div>
                  <div className="text-xs text-text-muted">SLAs em risco são escalados</div>
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
          <AppealsPanel />
        </motion.div>

        {/* Grounds Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Scale size={16} className="text-[#6366f1]" />
            Motivos de Recurso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <GroundsCard
              icon="✓"
              title="Erro Factual"
              description="O bloqueio foi baseado em informação incorreta."
            />
            <GroundsCard
              icon="📋"
              title="Contexto Ausente"
              description="Informações importantes não foram consideradas."
            />
            <GroundsCard
              icon="⚖️"
              title="Política Mal Aplicada"
              description="A regra foi interpretada incorretamente."
            />
            <GroundsCard
              icon="🆕"
              title="Nova Informação"
              description="Novos fatos surgiram após a decisão."
            />
            <GroundsCard
              icon="⚖️"
              title="Proporcionalidade"
              description="A penalidade é exagerada para a violação."
            />
            <GroundsCard
              icon="📝"
              title="Irregularidade"
              description="Houve falha no processo de revisão."
            />
          </div>
        </motion.div>

        {/* Decision Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Tipos de Decisão
          </h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <DecisionType
              label="Reformado"
              description="Decisão original revogada"
              color="#22c55e"
            />
            <DecisionType
              label="Mantido"
              description="Decisão original confirmada"
              color="#ef4444"
            />
            <DecisionType
              label="Modificado"
              description="Decisão ajustada"
              color="#6366f1"
            />
            <DecisionType
              label="Devolvido"
              description="Enviado para nova análise"
              color="#f59e0b"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface GroundsCardProps {
  icon: string;
  title: string;
  description: string;
}

function GroundsCard({ icon, title, description }: GroundsCardProps) {
  return (
    <div className="p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium text-text-primary">{title}</span>
      </div>
      <p className="text-xs text-text-muted">{description}</p>
    </div>
  );
}

interface DecisionTypeProps {
  label: string;
  description: string;
  color: string;
}

function DecisionType({ label, description, color }: DecisionTypeProps) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-6 py-3 rounded-lg"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <span className="text-sm font-semibold" style={{ color }}>
        {label}
      </span>
      <span className="text-xs text-text-muted">{description}</span>
    </div>
  );
}
