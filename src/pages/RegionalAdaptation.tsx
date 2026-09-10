import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Info, Calendar, Clock, Sun, Users } from 'lucide-react';
import { RegionalAdaptationPanel } from '../components/governance/RegionalAdaptationPanel';

export const RegionalAdaptation: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center">
                <Globe size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Adaptação Regional
                </h1>
                <p className="text-sm text-text-muted">
                  Suporte multi-região com fusos, feriados e cultura local
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
        className="mx-6 mt-6 p-4 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info size={18} className="text-[#06b6d4] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-1">
              Adaptação para Múltiplas Regiões
            </p>
            <p>
              O sistema considera timezone, feriados locais, melhores horários de postagem
              e características culturais de cada região para otimizar o impacto do conteúdo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Globe size={14} className="text-[#6366f1] mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Multi-Região</div>
                  <div className="text-xs text-text-muted">Suporte BR, US, EU, LATAM, APAC</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Calendar size={14} className="text-[#f59e0b] mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Feriados</div>
                  <div className="text-xs text-text-muted">Calendários locais precisos</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-bg-secondary/50 rounded-lg">
                <Sun size={14} className="text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-xs font-medium text-text-primary">Melhor Timing</div>
                  <div className="text-xs text-text-muted">Otimização por região</div>
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
          <RegionalAdaptationPanel />
        </motion.div>

        {/* Supported Regions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Globe size={16} className="text-[#06b6d4]" />
            Regiões Suportadas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <RegionInfoCard flag="🇧🇷" name="Brasil" currency="BRL" timezone="BRT (UTC-3)" />
            <RegionInfoCard flag="🇺🇸" name="Estados Unidos" currency="USD" timezone="EST/PDT" />
            <RegionInfoCard flag="🇪🇺" name="Europa" currency="EUR" timezone="CET (UTC+1)" />
            <RegionInfoCard flag="🌎" name="América Latina" currency="USD" timezone="CST (UTC-6)" />
            <RegionInfoCard flag="🌏" name="Ásia-Pacífico" currency="SGD" timezone="SGT (UTC+8)" />
          </div>
        </motion.div>

        {/* Cultural Adaptation Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users size={16} className="text-[#8b5cf6]" />
            Exemplos de Adaptação Cultural
          </h3>
          <div className="space-y-3">
            <CulturalExample
              region="🇧🇷 Brasil"
              example="Tom mais informal e próximo. Use expressões brasileiras."
              bestTime="10h-17h BRT"
            />
            <CulturalExample
              region="🇺🇸 Estados Unidos"
              example="Direto, orientado a resultados. Use métricas e dados."
              bestTime="8h-15h EST"
            />
            <CulturalExample
              region="🇪🇺 Europa"
              example="Valorize sustentabilidade e responsabilidade social. GDPR compliance."
              bestTime="9h-16h CET"
            />
            <CulturalExample
              region="🌎 América Latina"
              example="Tom caloroso e familiar. Valorize comunidade e família."
              bestTime="10h-17h CST"
            />
            <CulturalExample
              region="🌏 Ásia-Pacífico"
              example="Respeite hierarquia. Considere Chinese New Year, Golden Week."
              bestTime="9h-16h SGT"
            />
          </div>
        </motion.div>

        {/* Publishing Windows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-bg-card border border-border-default rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Clock size={16} className="text-[#22c55e]" />
            Janelas de Publicação por Região
          </h3>
          <div className="space-y-3">
            <TimeWindowBar region="🇧🇷 Brasil" start="08:00" end="20:00" />
            <TimeWindowBar region="🇺🇸 Estados Unidos" start="06:00" end="18:00" />
            <TimeWindowBar region="🇪🇺 Europa" start="07:00" end="17:00" />
            <TimeWindowBar region="🌎 América Latina" start="08:00" end="19:00" />
            <TimeWindowBar region="🌏 Ásia-Pacífico" start="08:00" end="17:00" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

interface RegionInfoCardProps {
  flag: string;
  name: string;
  currency: string;
  timezone: string;
}

function RegionInfoCard({ flag, name, currency, timezone }: RegionInfoCardProps) {
  return (
    <div className="p-3 bg-bg-secondary rounded-lg border border-border-default text-center">
      <div className="text-2xl mb-1">{flag}</div>
      <div className="text-sm font-medium text-text-primary">{name}</div>
      <div className="text-xs text-text-muted">{currency}</div>
      <div className="text-xs text-[#06b6d4]">{timezone}</div>
    </div>
  );
}

interface CulturalExampleProps {
  region: string;
  example: string;
  bestTime: string;
}

function CulturalExample({ region, example, bestTime }: CulturalExampleProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-secondary rounded-lg border border-border-default">
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">{region}</div>
        <div className="text-xs text-text-muted mt-1">{example}</div>
      </div>
      <div className="text-xs px-2 py-1 bg-[#22c55e]/10 text-[#22c55e] rounded">
        {bestTime}
      </div>
    </div>
  );
}

interface TimeWindowBarProps {
  region: string;
  start: string;
  end: string;
}

function TimeWindowBar({ region, start, end }: TimeWindowBarProps) {
  const parseHour = (time: string) => parseInt(time.split(':')[0]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-primary">{region}</span>
        <span className="text-text-muted">{start} - {end}</span>
      </div>
      <div className="relative h-6 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-[#06b6d4]/40 to-[#06b6d4]/40 rounded-full"
          style={{
            left: `${(parseHour(start) / 24) * 100}%`,
            width: `${((parseHour(end) - parseHour(start)) / 24) * 100}%`,
          }}
        />
        {/* Hour markers */}
        {[0, 6, 12, 18, 24].map((hour) => (
          <div
            key={hour}
            className="absolute top-0 bottom-0 w-px bg-border-default"
            style={{ left: `${(hour / 24) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
