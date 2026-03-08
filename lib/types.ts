export interface Shift {
  id: string;
  date: string;           // ISO "2026-03-06"
  displayDate: string;    // "Mar 6"
  hours: number;
  totalEarned: number;    // What user enters (wage + tips combined)
  tips: number;           // Calculated: totalEarned - (hours * hourlyWage)
  hourlyWage: number;     // Snapshot of wage at time of logging
  shiftTime?: string;     // "4:30 PM" - optional start time for display
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledShift {
  id: string;
  date: string;           // ISO "2026-03-09"
  displayDate: string;    // "Mar 9"
  dayOfWeek: string;      // "Mon"
  startTime: string;      // "3:00 PM"
  role: string;           // "Server"
  estimatedHours: number;
  logged: boolean;
  loggedShiftId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedShift {
  date: string;           // ISO "2026-03-09"
  startTime: string;      // "3:00 PM"
  role: string;           // matched to user's roles or "Unknown"
  estimatedHours: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface Settings {
  hourlyWage: number;
  defaultShiftHours: number;
  roles: string[];
  roleWages: Record<string, number>; // per-role hourly wage overrides
  notificationsEnabled: boolean;
  shiftReminderMinutes: number;
  weeklySummaryEnabled: boolean;
  weeklySummaryDay: number; // 0=Sun
  cloudSyncEnabled: boolean;
  lastSyncedAt: string | null;
  geminiApiKey: string | null;
}

export interface AppData {
  shifts: Shift[];
  schedule: ScheduledShift[];
  settings: Settings;
  version: number;
  updatedAt: string;
}

