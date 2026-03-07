import * as Crypto from 'expo-crypto';

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
