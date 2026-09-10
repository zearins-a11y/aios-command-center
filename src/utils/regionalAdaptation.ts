/**
 * Regional Adaptation System
 * P2 from Benchmark Comparison
 *
 * Timezone-aware scheduling, holidays, cultural adaptation:
 * - Multiple timezone support
 * - Holiday calendars
 * - Cultural tone adaptation
 * - Local best practices
 */

export type Region =
  | 'br'
  | 'us'
  | 'eu'
  | 'latam'
  | 'apac';

export type Timezone =
  | 'America/Sao_Paulo'
  | 'America/New_York'
  | 'America/Los_Angeles'
  | 'America/Mexico_City'
  | 'Europe/London'
  | 'Europe/Paris'
  | 'Europe/Berlin'
  | 'Asia/Tokyo'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Australia/Sydney';

export type HolidayType = 'national' | 'regional' | 'observance' | 'company';

export interface RegionalConfig {
  region: Region;
  name: string;
  timezone: Timezone;
  currency: string;
  language: string;
  publishWindow: {
    start: string; // HH:mm
    end: string;
  };
  bestDaysToPost: string[]; // ['mon', 'tue', ...]
  bestHoursToPost: number[]; // [9, 10, 11, 14, 15, 16]
  blockedDays: string[]; // Days when posting is blocked
  holidays: Holiday[];
  culturalNotes: string[];
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // MM-DD or specific date
  type: HolidayType;
  affects: string[]; // Regions affected
  observed?: string; // Observed date if different
  description?: string;
}

export interface CulturalAdaptation {
  id: string;
  aspect: 'tone' | 'imagery' | 'format' | 'timing' | 'compliance';
  region: Region;
  recommendation: string;
  examples: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface PublishingSchedule {
  contentId: string;
  region: Region;
  scheduledTime: Date;
  localTime: string;
  adjustedFor: 'peak_hours' | 'holiday' | 'timezone' | 'cultural';
  adjustments: ScheduleAdjustment[];
}

export interface ScheduleAdjustment {
  type: 'delay' | 'advance' | 'cancel' | 'modify';
  reason: string;
  originalTime: Date;
  newTime: Date;
}

// REGION CONFIGS
export const REGION_CONFIGS: Record<Region, RegionalConfig> = {
  br: {
    region: 'br',
    name: 'Brasil',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
    publishWindow: { start: '08:00', end: '20:00' },
    bestDaysToPost: ['tue', 'wed', 'thu'],
    bestHoursToPost: [10, 11, 12, 14, 15, 16, 17],
    blockedDays: [],
    holidays: [],
    culturalNotes: [
      'Tom mais informal e próximo',
      'Use expressões brasileiras quando apropriado',
      'Valorize comunidade e conexões',
    ],
  },
  us: {
    region: 'us',
    name: 'Estados Unidos',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en-US',
    publishWindow: { start: '06:00', end: '18:00' },
    bestDaysToPost: ['tue', 'wed', 'thu'],
    bestHoursToPost: [8, 9, 10, 11, 12, 13, 14, 15],
    blockedDays: [],
    holidays: [],
    culturalNotes: [
      'Tom profissional e inspirador',
      'Foco em resultados e eficiência',
      'Use dados e métricas',
    ],
  },
  eu: {
    region: 'eu',
    name: 'Europa',
    timezone: 'Europe/London',
    currency: 'EUR',
    language: 'en-GB',
    publishWindow: { start: '07:00', end: '17:00' },
    bestDaysToPost: ['tue', 'wed', 'thu', 'fri'],
    bestHoursToPost: [9, 10, 11, 14, 15, 16],
    blockedDays: [],
    holidays: [],
    culturalNotes: [
      'Valorize sustentabilidade e responsabilidade social',
      'Tom mais formal que US',
      'Respeite privacy regulations (GDPR)',
    ],
  },
  latam: {
    region: 'latam',
    name: 'América Latina',
    timezone: 'America/Mexico_City',
    currency: 'USD',
    language: 'es',
    publishWindow: { start: '08:00', end: '19:00' },
    bestDaysToPost: ['tue', 'wed', 'thu', 'fri'],
    bestHoursToPost: [10, 11, 12, 13, 14, 15, 16],
    blockedDays: [],
    holidays: [],
    culturalNotes: [
      'Tom caloroso e familiar',
      'Valorize família e comunidade',
      'Use español quando apropriado',
    ],
  },
  apac: {
    region: 'apac',
    name: 'Ásia-Pacífico',
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    language: 'en',
    publishWindow: { start: '08:00', end: '17:00' },
    bestDaysToPost: ['tue', 'wed', 'thu', 'fri'],
    bestHoursToPost: [9, 10, 11, 14, 15, 16],
    blockedDays: [],
    holidays: [],
    culturalNotes: [
      'Respeite hierarquia e formalidade',
      'Valorize tradição e inovação',
      'Considere múltiplos idiomas',
    ],
  },
};

// BRAZILIAN HOLIDAYS 2024
export const BRAZIL_HOLIDAYS: Holiday[] = [
  { id: 'br-1', name: 'Confraternização Universal', date: '01-01', type: 'national', affects: ['br'] },
  { id: 'br-2', name: 'Carnaval', date: '2024-02-12', type: 'national', affects: ['br'] },
  { id: 'br-3', name: 'Carnaval', date: '2024-02-13', type: 'national', affects: ['br'] },
  { id: 'br-4', name: 'Sexta-feira Santa', date: '2024-03-29', type: 'national', affects: ['br'] },
  { id: 'br-5', name: 'Tiradentes', date: '04-21', type: 'national', affects: ['br'] },
  { id: 'br-6', name: 'Dia do Trabalho', date: '05-01', type: 'national', affects: ['br'] },
  { id: 'br-7', name: 'Independência do Brasil', date: '09-07', type: 'national', affects: ['br'] },
  { id: 'br-8', name: 'Nossa Senhora Aparecida', date: '10-12', type: 'national', affects: ['br'] },
  { id: 'br-9', name: 'Finados', date: '11-02', type: 'national', affects: ['br'] },
  { id: 'br-10', name: 'Proclamação da República', date: '11-15', type: 'national', affects: ['br'] },
  { id: 'br-11', name: 'Natal', date: '12-25', type: 'national', affects: ['br'] },
  { id: 'br-12', name: 'Véspera de Ano Novo', date: '12-31', type: 'observance', affects: ['br'] },
];

// US HOLIDAYS 2024
export const US_HOLIDAYS: Holiday[] = [
  { id: 'us-1', name: "New Year's Day", date: '01-01', type: 'national', affects: ['us'] },
  { id: 'us-2', name: "Martin Luther King Jr. Day", date: '2024-01-15', type: 'national', affects: ['us'] },
  { id: 'us-3', name: "Presidents' Day", date: '2024-02-19', type: 'national', affects: ['us'] },
  { id: 'us-4', name: "Memorial Day", date: '2024-05-27', type: 'national', affects: ['us'] },
  { id: 'us-5', name: "Independence Day", date: '07-04', type: 'national', affects: ['us'] },
  { id: 'us-6', name: "Labor Day", date: '2024-09-02', type: 'national', affects: ['us'] },
  { id: 'us-7', name: "Thanksgiving", date: '2024-11-28', type: 'national', affects: ['us'] },
  { id: 'us-8', name: "Christmas Day", date: '12-25', type: 'national', affects: ['us'] },
];

// LATAM HOLIDAYS (examples)
export const LATAM_HOLIDAYS: Holiday[] = [
  { id: 'latam-1', name: 'Año Nuevo', date: '01-01', type: 'national', affects: ['latam'] },
  { id: 'latam-2', name: 'Día de la Constitución', date: '02-05', type: 'national', affects: ['latam'] },
  { id: 'latam-3', name: 'Natalício de Benito Juárez', date: '03-18', type: 'national', affects: ['latam'] },
  { id: 'latam-4', name: 'Día del Trabajo', date: '05-01', type: 'national', affects: ['latam'] },
  { id: 'latam-5', name: 'Independencia de México', date: '09-16', type: 'national', affects: ['latam'] },
  { id: 'latam-6', name: 'Día de los Muertos', date: '11-01', type: 'observance', affects: ['latam'] },
  { id: 'latam-7', name: 'Navidad', date: '12-25', type: 'national', affects: ['latam'] },
];

// CULTURAL ADAPTATIONS
export const CULTURAL_ADAPTATIONS: CulturalAdaptation[] = [
  {
    id: 'adapt-1',
    aspect: 'tone',
    region: 'br',
    recommendation: 'Use "você" form in Portuguese, keep tone warm and approachable',
    examples: ['Cumprimente de forma amigável', 'Use gírias sparingly', 'Valorize relacionamentos'],
    priority: 'high',
  },
  {
    id: 'adapt-2',
    aspect: 'timing',
    region: 'br',
    recommendation: 'Post between 10-17h BRT, avoid 12-14h siesta period',
    examples: ['10-11h BRT for professionals', '14-17h BRT for general audience'],
    priority: 'medium',
  },
  {
    id: 'adapt-3',
    aspect: 'compliance',
    region: 'br',
    recommendation: 'LGPD compliance mandatory, include privacy policies',
    examples: ['Display consent banners', 'Allow data deletion', 'Document data processing'],
    priority: 'high',
  },
  {
    id: 'adapt-4',
    aspect: 'tone',
    region: 'us',
    recommendation: 'Direct, action-oriented, results-focused language',
    examples: ['Use strong verbs', 'Quantify outcomes', 'Be confident'],
    priority: 'high',
  },
  {
    id: 'adapt-5',
    aspect: 'format',
    region: 'us',
    recommendation: 'Format for scannability, use bullets and headers',
    examples: ['Short paragraphs', 'Visual hierarchy', 'Clear CTAs'],
    priority: 'medium',
  },
  {
    id: 'adapt-6',
    aspect: 'tone',
    region: 'eu',
    recommendation: 'GDPR, sustainability, and social responsibility themes',
    examples: ['Highlight eco-initiatives', 'Respect privacy choices', 'Show community impact'],
    priority: 'high',
  },
  {
    id: 'adapt-7',
    aspect: 'tone',
    region: 'latam',
    recommendation: 'Warm, family-oriented, community-focused tone',
    examples: ['Include family imagery', 'Community success stories', 'Celebrate together'],
    priority: 'medium',
  },
  {
    id: 'adapt-8',
    aspect: 'timing',
    region: 'apac',
    recommendation: 'Consider Chinese New Year, Golden Week, Diwali periods',
    examples: ['Avoid major holidays', 'Respect local festivals', 'Localize calendars'],
    priority: 'high',
  },
];

// REGION LABELS
export const REGION_LABELS: Record<Region, string> = {
  br: '🇧🇷 Brasil',
  us: '🇺🇸 Estados Unidos',
  eu: '🇪🇺 Europa',
  latam: '🌎 América Latina',
  apac: '🌏 Ásia-Pacífico',
};

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  national: 'Feriado Nacional',
  regional: 'Feriado Regional',
  observance: 'Data Comemorativa',
  company: 'Feriado da Empresa',
};

/**
 * Get all holidays for a region
 */
export function getHolidaysForRegion(region: Region): Holiday[] {
  const allHolidays = [...BRAZIL_HOLIDAYS, ...US_HOLIDAYS, ...LATAM_HOLIDAYS];
  return allHolidays.filter((h) => h.affects.includes(region));
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date, region: Region): Holiday | null {
  const holidays = getHolidaysForRegion(region);
  const dateStr = date.toISOString().split('T')[0];
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return holidays.find((h) => {
    if (h.date === dateStr) return true;
    if (h.date === monthDay) return true;
    return false;
  }) || null;
}

/**
 * Get next upcoming holiday for region
 */
export function getNextHoliday(region: Region): Holiday | null {
  const holidays = getHolidaysForRegion(region);
  const now = new Date();
  const upcoming = holidays
    .filter((h) => new Date(h.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return upcoming[0] || null;
}

/**
 * Check if time is within publish window
 */
export function isWithinPublishWindow(time: Date, region: Region): boolean {
  const config = REGION_CONFIGS[region];
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const [startHour, startMin] = config.publishWindow.start.split(':').map(Number);
  const [endHour, endMin] = config.publishWindow.end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

/**
 * Get best posting time for region
 */
export function getBestPostingTime(region: Region): { hour: number; label: string } {
  const config = REGION_CONFIGS[region];
  const bestHour = config.bestHoursToPost[Math.floor(config.bestHoursToPost.length / 2)];
  return {
    hour: bestHour,
    label: `${bestHour}:00 ${config.timezone.split('/')[1]?.replace('_', ' ')}`,
  };
}

/**
 * Convert time to another timezone
 */
export function convertTimezone(date: Date, fromTz: Timezone, toTz: Timezone): Date {
  // Simplified implementation - in production use a proper timezone library
  const offsetDiff = getTimezoneOffset(toTz) - getTimezoneOffset(fromTz);
  return new Date(date.getTime() + offsetDiff * 60 * 60 * 1000);
}

/**
 * Get timezone offset in hours
 */
function getTimezoneOffset(tz: Timezone): number {
  const offsets: Record<Timezone, number> = {
    'America/Sao_Paulo': -3,
    'America/New_York': -5,
    'America/Los_Angeles': -8,
    'America/Mexico_City': -6,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Europe/Berlin': 1,
    'Asia/Tokyo': 9,
    'Asia/Shanghai': 8,
    'Asia/Singapore': 8,
    'Australia/Sydney': 10,
  };
  return offsets[tz] || 0;
}

/**
 * Suggest schedule adjustment based on regional factors
 */
export function suggestScheduleAdjustment(
  scheduledTime: Date,
  region: Region,
  reason: 'holiday' | 'timing' | 'compliance'
): ScheduleAdjustment | null {
  const holiday = isHoliday(scheduledTime, region);

  if (reason === 'holiday' && holiday) {
    // Suggest moving to next business day
    const nextDay = new Date(scheduledTime);
    nextDay.setDate(nextDay.getDate() + 1);

    return {
      type: 'delay',
      reason: `Feriado: ${holiday.name}`,
      originalTime: scheduledTime,
      newTime: nextDay,
    };
  }

  if (reason === 'timing' && !isWithinPublishWindow(scheduledTime, region)) {
    const bestTime = getBestPostingTime(region);
    const adjustedTime = new Date(scheduledTime);
    adjustedTime.setHours(bestTime.hour, 0, 0, 0);

    return {
      type: 'modify',
      reason: 'Fora da janela de publicação recomendada',
      originalTime: scheduledTime,
      newTime: adjustedTime,
    };
  }

  return null;
}
