// === Shift & Schedule ===

export interface ShiftExtras {
  role?: string;
  cashTips?: number;
  creditTips?: number;
  notes?: string;
  tags?: string[];
  totalSales?: number;
  tipOutMode?: 'percent' | 'sales' | 'cash';
  tipOutPercent?: number;
  jobId?: string;
  clientId?: string;
}

export interface Shift {
  id: string;
  date: string;           // ISO "2026-03-06"
  displayDate: string;    // "Mar 6"
  hours: number;
  totalEarned: number;    // Calculated: (hours * hourlyWage) + tips - tipOut
  tips: number;           // Gross tips entered by user
  tipOut: number;         // Tip out amount in dollars
  hourlyWage: number;     // Snapshot of wage at time of logging
  shiftTime?: string;     // "4:30 PM" - optional start time for display
  // Phase 1 fields
  role?: string;
  cashTips?: number;
  creditTips?: number;
  notes?: string;
  tags?: string[];
  totalSales?: number;
  tipOutMode?: 'percent' | 'sales' | 'cash';
  tipOutPercent?: number;
  // Phase 3 fields
  jobId?: string;
  clientId?: string;
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

// === Jobs (Phase 3) ===

export interface Job {
  id: string;
  name: string;
  type: 'restaurant' | 'bar' | 'delivery' | 'salon' | 'hotel' | 'other';
  roles: string[];
  roleWages: Record<string, number>;
  defaultRole?: string;
  defaultTipOutMode?: 'percent' | 'sales' | 'cash';
  defaultTipOutPercent?: number;
  tipOutRecipients?: TipOutRecipient[];
  isActive: boolean;
  createdAt: string;
}

export interface TipOutRecipient {
  id: string;
  name: string;
  method: 'percent_tips' | 'percent_sales' | 'fixed';
  value: number;
}

// === Expenses (Phase 3) ===

export interface Expense {
  id: string;
  date: string;
  category: 'mileage' | 'supplies' | 'uniform' | 'booth_rent' | 'equipment' | 'other';
  amount: number;
  description?: string;
  jobId?: string;
  createdAt: string;
}

// === Goals (Phase 3) ===

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  target: number;
  jobId?: string;
  isActive: boolean;
  createdAt: string;
}

// === Clients (Phase 5) ===

export interface Client {
  id: string;
  name: string;
  avgTip: number;
  visitCount: number;
  notes?: string;
  jobId?: string;
  createdAt: string;
}

// === Settings ===

export interface Settings {
  hourlyWage: number;
  defaultShiftHours: number;
  roles: string[];
  roleWages: Record<string, number>;
  notificationsEnabled: boolean;
  shiftReminderMinutes: number;
  weeklySummaryEnabled: boolean;
  weeklySummaryDay: number;
  cloudSyncEnabled: boolean;
  lastSyncedAt: string | null;
  geminiApiKey: string | null;
  // Phase 1 - quick entry memory
  lastTipOutMode?: 'percent' | 'sales' | 'cash';
  lastTipOutPercent?: number;
  lastRole?: string;
  // Phase 2 - tax
  taxFilingStatus?: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  stateTaxRate?: number;
  taxYear?: number;
  enableTaxTracking?: boolean;
  // Phase 3 - multi-job
  activeJobId?: string;
  mileageRate?: number;
}

export interface AppData {
  shifts: Shift[];
  schedule: ScheduledShift[];
  jobs: Job[];
  expenses: Expense[];
  goals: Goal[];
  clients: Client[];
  settings: Settings;
  version: number;
  updatedAt: string;
  hasSeenOnboarding?: boolean;
  isNewCustomerMode?: boolean;
}
