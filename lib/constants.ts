import { Settings, AppData } from './types';

export const STORAGE_KEY = 'tiptally-data';

// Clean, playful color system
export const C = {
  // Backgrounds
  bg: '#0B0F14',
  card: '#141A23',
  cardHover: '#1A2230',
  surface: '#111820',
  // Borders
  border: '#1E2A38',
  borderLight: '#2A3A4D',
  // Text
  text: '#F0F4F8',
  textSoft: '#B0BEC8',
  textMuted: '#6B7D8E',
  textFaint: '#3E4F5F',
  // Primary green
  green: '#00FF88',
  greenSoft: '#00CC6A',
  greenBg: '#00FF8815',
  greenBorder: '#00FF8830',
  // Accent palette - playful
  purple: '#B18CFF',
  purpleBg: '#B18CFF15',
  gold: '#FFD166',
  goldBg: '#FFD16615',
  blue: '#6CB4FF',
  blueBg: '#6CB4FF15',
  coral: '#FF7A7A',
  coralBg: '#FF7A7A15',
  mint: '#5BEAD6',
  mintBg: '#5BEAD615',
  peach: '#FFB088',
  peachBg: '#FFB08815',
  // Functional
  success: '#00FF88',
  danger: '#FF6B6B',
  dangerBg: '#FF6B6B15',
  warning: '#FFD166',
};

export const DEFAULT_SETTINGS: Settings = {
  hourlyWage: 12.15,
  defaultShiftHours: 6,
  roles: ['Server', 'Patio Server', 'Bartender'],
  notificationsEnabled: true,
  shiftReminderMinutes: 60,
  weeklySummaryEnabled: true,
  weeklySummaryDay: 0,
  cloudSyncEnabled: false,
  lastSyncedAt: null,
  geminiApiKey: null,
};

export const DEFAULT_APP_DATA: AppData = {
  shifts: [],
  schedule: [],
  settings: DEFAULT_SETTINGS,
  version: 1,
  updatedAt: new Date().toISOString(),
};
