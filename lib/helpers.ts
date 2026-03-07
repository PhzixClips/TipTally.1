import * as Crypto from 'expo-crypto';
import { Shift, ScheduledShift } from './types';

// === EXISTING FUNCTIONS ===

export function generateId(): string {
  return Crypto.randomUUID();
}

export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getDayOfWeek(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isToday(isoDate: string): boolean {
  return isoDate === toISODate(new Date());
}

export function getWeekStart(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0=Sun
  date.setDate(date.getDate() - day);
  return toISODate(date);
}

export function formatWeekLabel(weekStartISO: string): string {
  return `Week of ${formatDisplayDate(weekStartISO)}`;
}

export function calculateTips(totalEarned: number, hours: number, hourlyWage: number): number {
  return Math.max(0, +(totalEarned - hours * hourlyWage).toFixed(2));
}

// === NEW FUNCTIONS ===

/** Get full day name like "Monday", "Tuesday" etc from ISO date */
export function getDayOfWeekFull(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/** Get day index 0=Sun, 1=Mon ... 6=Sat from ISO date */
export function getDayIndex(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** Group shifts by day of week. Returns map of dayName -> shifts[] */
export function groupShiftsByDayOfWeek(shifts: Shift[]): Map<string, Shift[]> {
  const map = new Map<string, Shift[]>();
  const dayOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Initialize all days
  dayOrder.forEach(d => map.set(d, []));
  shifts.forEach(s => {
    const day = getDayOfWeek(s.date);
    const existing = map.get(day) || [];
    existing.push(s);
    map.set(day, existing);
  });
  return map;
}

/** Calculate day-of-week averages from logged shifts. Returns sorted by avg descending. */
export interface DayAverage {
  day: string;        // "Fri"
  dayFull: string;    // "FRIDAY"
  avgEarned: number;
  shiftCount: number;
  totalEarned: number;
  avgHourly: number;
  avgHours: number;
  avgTips: number;
  shifts: Shift[];
}

export function getDayOfWeekAverages(shifts: Shift[]): DayAverage[] {
  const dayMap = groupShiftsByDayOfWeek(shifts);
  const fullNames: Record<string, string> = {
    Sun: 'SUNDAY', Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY',
    Thu: 'THURSDAY', Fri: 'FRIDAY', Sat: 'SATURDAY',
  };

  const results: DayAverage[] = [];
  dayMap.forEach((dayShifts, day) => {
    if (dayShifts.length === 0) return;
    const total = dayShifts.reduce((s, sh) => s + sh.totalEarned, 0);
    const totalTips = dayShifts.reduce((s, sh) => s + sh.tips, 0);
    const totalHours = dayShifts.reduce((s, sh) => s + sh.hours, 0);
    results.push({
      day,
      dayFull: fullNames[day] || day.toUpperCase(),
      avgEarned: total / dayShifts.length,
      shiftCount: dayShifts.length,
      totalEarned: total,
      avgHourly: dayShifts.reduce((s, sh) => s + sh.totalEarned / sh.hours, 0) / dayShifts.length,
      avgHours: totalHours / dayShifts.length,
      avgTips: totalTips / dayShifts.length,
      shifts: [...dayShifts].sort((a, b) => b.date.localeCompare(a.date)),
    });
  });

  // Sort by avgEarned descending
  return results.sort((a, b) => b.avgEarned - a.avgEarned);
}

/** Group shifts by week (week starting Sunday). Returns sorted newest first. */
export interface WeekGroup {
  weekStart: string;  // ISO date of Sunday
  label: string;      // "Week of Mar 1"
  shifts: Shift[];
  totalEarned: number;
  totalTips: number;
  totalHours: number;
  avgPerShift: number;
}

export function groupShiftsByWeek(shifts: Shift[]): WeekGroup[] {
  const weekMap = new Map<string, Shift[]>();
  shifts.forEach(s => {
    const ws = getWeekStart(s.date);
    const existing = weekMap.get(ws) || [];
    existing.push(s);
    weekMap.set(ws, existing);
  });

  const weeks: WeekGroup[] = [];
  weekMap.forEach((weekShifts, weekStart) => {
    const sorted = [...weekShifts].sort((a, b) => b.date.localeCompare(a.date));
    const totalEarned = sorted.reduce((s, sh) => s + sh.totalEarned, 0);
    const totalTips = sorted.reduce((s, sh) => s + sh.tips, 0);
    const totalHours = sorted.reduce((s, sh) => s + sh.hours, 0);
    weeks.push({
      weekStart,
      label: formatWeekLabel(weekStart),
      shifts: sorted,
      totalEarned,
      totalTips,
      totalHours,
      avgPerShift: sorted.length ? totalEarned / sorted.length : 0,
    });
  });

  return weeks.sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

/** Get all weeks of a given month (or current month). Returns week start dates. */
export function getMonthWeeks(year?: number, month?: number): string[] {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth(); // 0-indexed

  const weeks: string[] = [];
  const seen = new Set<string>();

  // Go through each day of the month
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d);
    const ws = getWeekStart(toISODate(date));
    if (!seen.has(ws)) {
      seen.add(ws);
      weeks.push(ws);
    }
  }

  return weeks.sort();
}

/** Get day-of-week average for a specific day (e.g., "Mon"). Returns average earnings or fallback. */
export function getDayAverage(shifts: Shift[], dayShort: string): number {
  const dayShifts = shifts.filter(s => getDayOfWeek(s.date) === dayShort);
  if (dayShifts.length === 0) {
    // Fallback to overall average
    return shifts.length ? shifts.reduce((s, sh) => s + sh.totalEarned, 0) / shifts.length : 0;
  }
  return dayShifts.reduce((s, sh) => s + sh.totalEarned, 0) / dayShifts.length;
}

/** Get the start and end ISO dates for the current month */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = toISODate(new Date(y, m, 1));
  const end = toISODate(new Date(y, m + 1, 0));
  return { start, end };
}
