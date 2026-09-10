import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, Shield, CheckCircle2, Clock, Eye } from 'lucide-react';
import { PublicExceptionsPanel } from '../components/governance/PublicExceptionsPanel';

export const PublicExceptions: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Exceções Públicas
                </h1>
                <p className="text-sm text-text-muted">
                  Log de transparência para decisões do sistema
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
        className="mx-6 mt-6 p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-1">
              Transparência nas Exceções
            </p>
            <p>
              Este log registra todas as exceções concedidas pelo sistema, mantendo transparência
              com stakeholders sobre quando políticas são alteradas ou overriden.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Eye size={14} className="text-[#6366f1] mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Visibilidade</div>
                  <div className="text-xs text-text-muted">Todos stakeholders têm acesso</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Clock size={14} className="text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Expiração</div>
                  <div className="text-xs text-text-muted">Exceções têm prazo limitado</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Shield size={14} className="text-green-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Controle</div>
                  <div className="text-xs text-text-muted">Condições e monitoramento</div>
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
          <PublicExceptionsPanel />
        </motion.div>

        {/* Exception Types Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#f59e0b]" />
            Tipos de Exceção
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <ExceptionTypeCard icon="⚡" label="Override de Política" description="Altera política padrão" />
            <ExceptionTypeCard icon="⏰" label="Extensão de Prazo" description="Adia deadline" />
            <ExceptionTypeCard icon="✅" label="Aprovação de Conteúdo" description="Libera conteúdo especial" />
            <ExceptionTypeCard icon="🔓" label="Bypass de Feature" description="Desabilita controle" />
            <ExceptionTypeCard icon="🚨" label="Acesso de Emergência" description="Acesso rápido" />
            <ExceptionTypeCard icon="🛡️" label="Dispensa Compliance" description="Isenta requisito" />
          </div>
        </motion.div>

        {/* When to Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Quando Registrar Exceções
          </h3>
          <div className="space-y-3">
            <WhenToUseCard
              title="Urgência de Negócio"
              description="Quando uma decisão de negócio requer bypass de processo normal."
              example="Black Friday, lançamento de produto, crise de comunicação."
            />
            <WhenToUseCard
              title="Circunstâncias Excepcionais"
              description="Situações não previstas pelas políticas padrão."
              example="Influenciador com horário específico, evento mundial."
            />
            <WhenToUseCard
              title="Análise de Risco"
              description="Quando o risco é calculado e aceito conscientemente."
              example="Aprovação com condições e monitoramento."
            />
            <WhenToUseCard
              title="Melhoria Contínua"
              description="Para identificar padrões e melhorar políticas futuras."
              example="Exceções recorrentes indicam necessidade de ajuste."
            />
          </div>
        </motion.div>

        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-400" />
            Boas Práticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <BestPracticeCard
              title="Documente o Justificativa"
              description="Explicações claras são essenciais para auditoria."
            />
            <BestPracticeCard
              title="Defina Condições"
              description="Cada exceção deve ter condições específicas."
            />
            <BestPracticeCard
              title="Estabeleça Expiração"
              description="Exceções não devem ser permanentes."
            />
            <BestPracticeCard
              title="Revise Regularmente"
              description="Exceções recorrentes indicam necessidade de política."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface ExceptionTypeCardProps {
  icon: string;
  label: string;
  description: string;
}

function ExceptionTypeCard({ icon, label, description }: ExceptionTypeCardProps) {
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
  example: string;
}

function WhenToUseCard({ title, description, example }: WhenToUseCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div className="w-2 h-2 rounded-full bg-[#f59e0b] mt-2 flex-shrink-0" />
      <div>
        <div className="text-sm font-medium text-text-primary">{title}</div>
        <div className="text-xs text-text-muted mt-1">{description}</div>
        <div className="text-xs text-[#6366f1] mt-1 italic">"{example}"</div>
      </div>
    </div>
  );
}

interface BestPracticeCardProps {
  title: string;
  description: string;
}

function BestPracticeCard({ title, description }: BestPracticeCardProps) {
  return (
    <div className="flex items-start gap-2 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
      <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs font-medium text-text-primary">{title}</div>
        <div className="text-xs text-text-muted mt-1">{description}</div>
      </div>
    </div>
  );
}
