import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Calendar,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
} from 'lucide-react';
import { useRegionalAdaptationStore, REGION_LABELS } from '../../stores/useRegionalAdaptationStore';
import {
  Region,
} from '../../utils/regionalAdaptation';

// Region Card
function RegionCard({ region }: { region: Region }) {
  const { getConfig, getHolidays, getNextHolidayForRegion, activeRegions, removeRegion } = useRegionalAdaptationStore();
  const config = getConfig(region);
  const holidays = getHolidays(region);
  const nextHoliday = getNextHolidayForRegion(region);
  const isActive = activeRegions.includes(region);

  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border-default rounded-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-lg">
              {region === 'br' ? '🇧🇷' : region === 'us' ? '🇺🇸' : region === 'eu' ? '🇪🇺' : region === 'latam' ? '🌎' : '🌏'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{config.name}</h3>
              <p className="text-xs text-text-muted">{config.timezone.split('/')[1]?.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                Ativo
              </span>
            )}
            {region !== 'br' && (
              <button
                onClick={() => removeRegion(region)}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                title="Remover região"
              >
                <X size={16} className="text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-bg-secondary rounded">
            <Clock size={14} className="mx-auto mb-1 text-[#6366f1]" />
            <p className="text-xs text-text-muted">Janela</p>
            <p className="text-xs font-medium text-text-primary">{config.publishWindow.start}-{config.publishWindow.end}</p>
          </div>
          <div className="text-center p-2 bg-bg-secondary rounded">
            <Calendar size={14} className="mx-auto mb-1 text-[#f59e0b]" />
            <p className="text-xs text-text-muted">Feriados</p>
            <p className="text-xs font-medium text-text-primary">{holidays.length}</p>
          </div>
          <div className="text-center p-2 bg-bg-secondary rounded">
            <Sun size={14} className="mx-auto mb-1 text-yellow-400" />
            <p className="text-xs text-text-muted">Melhor Hora</p>
            <p className="text-xs font-medium text-text-primary">{config.bestHoursToPost[0]}:00</p>
          </div>
        </div>

        {/* Next Holiday */}
        {nextHoliday && (
          <div className="p-2 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg mb-3">
            <p className="text-xs text-text-muted">Próximo Feriado</p>
            <p className="text-sm font-medium text-[#f59e0b]">
              {nextHoliday.name} ({new Date(nextHoliday.date).toLocaleDateString('pt-BR')})
            </p>
          </div>
        )}

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-xs text-text-muted hover:text-text-primary py-1"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Recolher' : 'Ver detalhes'}
        </button>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-border-default overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Best Days */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Melhores Dias</h4>
                <div className="flex gap-1">
                  {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((day, idx) => {
                    const isBest = config.bestDaysToPost.includes(day);
                    return (
                      <span
                        key={day}
                        className={`px-2 py-1 rounded text-xs ${
                          isBest
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-bg-secondary text-text-muted'
                        }`}
                      >
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][idx]}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Best Hours */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Melhores Horários</h4>
                <div className="flex flex-wrap gap-1">
                  {config.bestHoursToPost.map((hour) => (
                    <span key={hour} className="px-2 py-1 bg-[#6366f1]/20 text-[#6366f1] rounded text-xs">
                      {hour}:00
                    </span>
                  ))}
                </div>
              </div>

              {/* Cultural Notes */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Notas Culturais</h4>
                <ul className="space-y-1">
                  {config.culturalNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                      <span className="text-[#6366f1]">•</span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Holidays List */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">Feriados ({holidays.length})</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {holidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{holiday.name}</span>
                      <span className="text-text-muted">{new Date(holiday.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Panel Component
interface RegionalAdaptationPanelProps {
  compact?: boolean;
}

export function RegionalAdaptationPanel({ compact = false }: RegionalAdaptationPanelProps) {
  const {
    activeRegions,
    timezone,
    holidayAware,
    culturalAdaptation,
    autoAdjustSchedule,
    addRegion,
    toggleHolidayAware,
    toggleCulturalAdaptation,
    toggleAutoAdjustSchedule,
    getStats,
  } = useRegionalAdaptationStore();

  const stats = getStats();
  const allRegions: Region[] = ['br', 'us', 'eu', 'latam', 'apac'];
  const availableRegions = allRegions.filter((r) => !activeRegions.includes(r));

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Adaptação Regional
          </h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {activeRegions.map((region) => (
            <span key={region} className="px-2 py-1 bg-bg-secondary rounded text-xs text-text-muted">
              {REGION_LABELS[region]}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Adaptação Regional
          </h3>
          <p className="text-xs text-text-muted mt-1">
            P2 - Suporte multi-região, fusos e calendário de feriados
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={14} className="text-[#6366f1]" />
            <span className="text-xs text-text-muted">Regiões</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats.regionsCount}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-[#f59e0b]" />
            <span className="text-xs text-text-muted">Feriados</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats.holidaysCount}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Sun size={14} className="text-green-400" />
            <span className="text-xs text-text-muted">Adaptações</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats.adaptationsCount}</div>
        </div>
        <div className="p-3 bg-bg-card border border-border-default rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Moon size={14} className="text-purple-400" />
            <span className="text-xs text-text-muted">Timezone</span>
          </div>
          <div className="text-sm font-bold text-text-primary truncate">{timezone.split('/')[1]?.replace('_', ' ')}</div>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-3">
        <ToggleSwitch
          label="Feriados Ativos"
          description="Bloquear publicações em feriados"
          enabled={holidayAware}
          onToggle={toggleHolidayAware}
        />
        <ToggleSwitch
          label="Adaptação Cultural"
          description="Ajustar tom e conteúdo por região"
          enabled={culturalAdaptation}
          onToggle={toggleCulturalAdaptation}
        />
        <ToggleSwitch
          label="Ajuste Automático"
          description="Ajustar horários automaticamente"
          enabled={autoAdjustSchedule}
          onToggle={toggleAutoAdjustSchedule}
        />
      </div>

      {/* Add Region */}
      {availableRegions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3">Adicionar Região</h4>
          <div className="flex flex-wrap gap-2">
            {availableRegions.map((region) => (
              <button
                key={region}
                onClick={() => addRegion(region)}
                className="px-3 py-2 bg-bg-secondary border border-dashed border-border-default rounded-lg text-xs text-text-muted hover:text-text-primary hover:border-[#6366f1] transition-colors"
              >
                + {REGION_LABELS[region]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Regions */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">Regiões Ativas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeRegions.map((region) => (
            <RegionCard key={region} region={region} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ label, description, enabled, onToggle }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
        enabled
          ? 'bg-[#6366f1]/10 border-[#6366f1]/30'
          : 'bg-bg-card border-border-default'
      }`}
    >
      <div
        className={`w-10 h-5 rounded-full transition-colors relative ${
          enabled ? 'bg-[#6366f1]' : 'bg-bg-secondary'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      <div className="text-left">
        <div className={`text-sm font-medium ${enabled ? 'text-[#6366f1]' : 'text-text-primary'}`}>
          {label}
        </div>
        <div className="text-xs text-text-muted">{description}</div>
      </div>
    </button>
  );
}
