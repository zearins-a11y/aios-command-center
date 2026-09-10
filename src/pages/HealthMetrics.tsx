import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Info, BarChart3, TrendingUp, CheckCircle2, AlertTriangle, Clock, Shield, Zap, Users, Target } from 'lucide-react';
import { HealthMetricsPanel } from '../components/governance/HealthMetricsPanel';

export const HealthMetrics: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center">
                <Activity size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Métricas de Saúde
                </h1>
                <p className="text-sm text-text-muted">
                  Monitoramento da saúde do sistema de governança
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
        className="mx-6 mt-6 p-4 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[#22c55e] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-1">
              Visibilidade em Tempo Real
            </p>
            <p>
              Acompanhe métricas-chave do sistema de governança AIOS: taxa de aprovações,
              tempo de resolução, precisão dos thresholds e muito mais.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <BarChart3 size={14} className="text-[#6366f1] mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Métricas</div>
                  <div className="text-xs text-text-muted">8 KPIs monitorados</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <TrendingUp size={14} className="text-green-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Tendências</div>
                  <div className="text-xs text-text-muted">Últimos 30 dias</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Target size={14} className="text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Metas</div>
                  <div className="text-xs text-text-muted">Targets configuráveis</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Activity size={14} className="text-red-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Alertas</div>
                  <div className="text-xs text-text-muted">Automáticos</div>
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
          <HealthMetricsPanel />
        </motion.div>

        {/* Metrics Definitions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-[#22c55e]" />
            Definição das Métricas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MetricDefinition
              name="Aprovações Processadas"
              description="Número de aprovações processadas por dia"
              target="50/dia"
              icon={<Clock size={14} />}
            />
            <MetricDefinition
              name="Tempo Médio de Resolução"
              description="Tempo médio para resolver uma aprovação"
              target="60 min"
              icon={<Activity size={14} />}
            />
            <MetricDefinition
              name="Taxa de Strikes"
              description="Porcentagem de agentes com strikes ativos"
              target="<5%"
              icon={<Shield size={14} />}
            />
            <MetricDefinition
              name="Precisão dos Thresholds"
              description="Percentual de decisões que seguem os thresholds"
              target=">90%"
              icon={<Target size={14} />}
            />
            <MetricDefinition
              name="Taxa de Auto-Aprovação"
              description="Percentual de aprovações automáticas"
              target="70%"
              icon={<Zap size={14} />}
            />
            <MetricDefinition
              name="Taxa de Revisão Humana"
              description="Percentual que requer revisão humana"
              target="20%"
              icon={<Users size={14} />}
            />
            <MetricDefinition
              name="Taxa de Aprovação de Recursos"
              description="Percentual de recursos aprovados"
              target="30%"
              icon={<CheckCircle2 size={14} />}
            />
            <MetricDefinition
              name="Taxa de Exceções"
              description="Percentual de aprovações que geram exceções"
              target="<5%"
              icon={<AlertTriangle size={14} />}
            />
          </div>
        </motion.div>

        {/* Health Score Interpretation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4">
            Interpretação do Score de Saúde
          </h3>
          <div className="space-y-3">
            <HealthScoreInterpretation
              range="80-100"
              status="Saúdo"
              color="#22c55e"
              icon="✅"
              description="Sistema operando dentro dos parâmetros esperados. Continue monitorando."
            />
            <HealthScoreInterpretation
              range="50-79"
              status="Atenção"
              color="#fbbf24"
              icon="⚠️"
              description="Sistema com algumas métricas fora do target. Revise e ajuste thresholds."
            />
            <HealthScoreInterpretation
              range="0-49"
              status="Crítico"
              color="#ef4444"
              icon="🚨"
              description="Sistema requer atenção imediata. Intervenção manual recomendada."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface MetricDefinitionProps {
  name: string;
  description: string;
  target: string;
  icon: React.ReactNode;
}

function MetricDefinition({ name, description, target, icon }: MetricDefinitionProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div className="w-8 h-8 rounded-lg bg-[#6366f1]/20 flex items-center justify-center text-[#6366f1]">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">{name}</div>
        <div className="text-xs text-text-muted mt-0.5">{description}</div>
        <div className="mt-1 inline-flex items-center px-2 py-0.5 bg-[#22c55e]/10 text-[#22c55e] rounded text-xs font-medium">
          Meta: {target}
        </div>
      </div>
    </div>
  );
}

interface HealthScoreInterpretationProps {
  range: string;
  status: string;
  color: string;
  icon: string;
  description: string;
}

function HealthScoreInterpretation({
  range,
  status,
  color,
  icon,
  description,
}: HealthScoreInterpretationProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color }}>
            {status}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-bg-primary text-text-muted">
            {range}
          </span>
        </div>
        <div className="text-xs text-text-muted mt-1">{description}</div>
      </div>
    </div>
  );
}
