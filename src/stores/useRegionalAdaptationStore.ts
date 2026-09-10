import { create } from 'zustand';
import {
  Region,
  RegionalConfig,
  CulturalAdaptation,
  Holiday,
  REGION_CONFIGS,
  REGION_LABELS,
  getHolidaysForRegion,
  isHoliday,
  getNextHoliday,
  isWithinPublishWindow,
  getBestPostingTime,
  CULTURAL_ADAPTATIONS,
} from '../utils/regionalAdaptation';

interface RegionalAdaptationStore {
  // Config
  activeRegions: Region[];
  primaryRegion: Region;

  // Settings
  timezone: string;
  holidayAware: boolean;
  culturalAdaptation: boolean;
  autoAdjustSchedule: boolean;

  // Actions
  setPrimaryRegion: (region: Region) => void;
  addRegion: (region: Region) => void;
  removeRegion: (region: Region) => void;
  setTimezone: (timezone: string) => void;
  toggleHolidayAware: () => void;
  toggleCulturalAdaptation: () => void;
  toggleAutoAdjustSchedule: () => void;

  // Queries
  getConfig: (region: Region) => RegionalConfig;
  getHolidays: (region: Region) => Holiday[];
  checkHoliday: (date: Date, region: Region) => Holiday | null;
  getNextHolidayForRegion: (region: Region) => Holiday | null;
  isInPublishWindow: (time: Date, region: Region) => boolean;
  getBestTime: (region: Region) => { hour: number; label: string };
  getAdaptations: (region?: Region) => CulturalAdaptation[];
  getStats: () => {
    regionsCount: number;
    holidaysCount: number;
    adaptationsCount: number;
    holidayAware: boolean;
    culturalAdaptation: boolean;
  };
}

export const useRegionalAdaptationStore = create<RegionalAdaptationStore>((set, get) => ({
  activeRegions: ['br', 'us'],
  primaryRegion: 'br',

  timezone: 'America/Sao_Paulo',
  holidayAware: true,
  culturalAdaptation: true,
  autoAdjustSchedule: true,

  setPrimaryRegion: (region) => set({ primaryRegion: region }),

  addRegion: (region) => {
    set((state) => {
      if (state.activeRegions.includes(region)) return state;
      return { activeRegions: [...state.activeRegions, region] };
    });
  },

  removeRegion: (region) => {
    set((state) => {
      const newRegions = state.activeRegions.filter((r) => r !== region);
      return {
        activeRegions: newRegions.length > 0 ? newRegions : ['br'],
        primaryRegion: state.primaryRegion === region ? (newRegions[0] || 'br') : state.primaryRegion,
      };
    });
  },

  setTimezone: (timezone) => set({ timezone }),

  toggleHolidayAware: () => set((state) => ({ holidayAware: !state.holidayAware })),

  toggleCulturalAdaptation: () => set((state) => ({ culturalAdaptation: !state.culturalAdaptation })),

  toggleAutoAdjustSchedule: () => set((state) => ({ autoAdjustSchedule: !state.autoAdjustSchedule })),

  getConfig: (region) => REGION_CONFIGS[region],

  getHolidays: (region) => getHolidaysForRegion(region),

  checkHoliday: (date, region) => isHoliday(date, region),

  getNextHolidayForRegion: (region) => getNextHoliday(region),

  isInPublishWindow: (time, region) => isWithinPublishWindow(time, region),

  getBestTime: (region) => getBestPostingTime(region),

  getAdaptations: (region) => {
    if (region) {
      return CULTURAL_ADAPTATIONS.filter((a) => a.region === region);
    }
    return CULTURAL_ADAPTATIONS;
  },

  getStats: () => {
    const { activeRegions, holidayAware, culturalAdaptation } = get();
    const regions = activeRegions;
    let holidaysCount = 0;
    regions.forEach((r) => {
      holidaysCount += getHolidaysForRegion(r).length;
    });
    const adaptationsCount = CULTURAL_ADAPTATIONS.filter((a) => regions.includes(a.region)).length;

    return {
      regionsCount: regions.length,
      holidaysCount,
      adaptationsCount,
      holidayAware,
      culturalAdaptation,
    };
  },
}));

// Re-export utilities
export { REGION_CONFIGS, REGION_LABELS, CULTURAL_ADAPTATIONS };
export type { Region, RegionalConfig, CulturalAdaptation, Holiday };
