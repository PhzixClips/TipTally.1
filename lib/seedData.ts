import { AppData, Shift, ScheduledShift, Expense, Goal } from './types';
import { DEFAULT_SETTINGS } from './constants';

// Deterministic ID generator for seed data
let seedCounter = 0;
function seedId(): string {
  return `seed-${String(++seedCounter).padStart(4, '0')}`;
}

function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDayOfWeek(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return toISODate(date);
}

// Seeded random for reproducibility
let seed = 42;
function rand(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

const WAGE = 12.15;
const ROLES = ['Server', 'Patio Server', 'Bartender'];
const TAGS_POOL = ['Patio', 'Bar', 'Double', 'Event', 'Slow', 'Busy', 'Training', 'Holiday'];
const SHIFT_TIMES = ['11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '4:30 PM', '5:00 PM', '6:00 PM'];

export function generateSeedData(): AppData {
  seedCounter = 0;
  seed = 42;

  const today = new Date();
  const todayISO = toISODate(today);
  const shifts: Shift[] = [];
  const now = new Date().toISOString();

  // Generate ~6 weeks of past shifts (roughly 4-5 shifts per week)
  for (let weeksAgo = 6; weeksAgo >= 0; weeksAgo--) {
    // Pick 4-5 days per week to work
    const daysWorked = weeksAgo === 0
      ? randInt(2, Math.min(today.getDay(), 5))  // Current week: only up to today
      : randInt(3, 5);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - weeksAgo * 7);

    const availableDays = weeksAgo === 0
      ? Array.from({ length: today.getDay() + 1 }, (_, i) => i)
      : [0, 1, 2, 3, 4, 5, 6];

    // Shuffle and pick days
    const shuffled = [...availableDays].sort(() => rand() - 0.5);
    const workDays = shuffled.slice(0, daysWorked);

    for (const dayOffset of workDays) {
      const shiftDate = new Date(weekStart);
      shiftDate.setDate(weekStart.getDate() + dayOffset);
      const dateISO = toISODate(shiftDate);

      // Skip future dates
      if (dateISO > todayISO) continue;

      const role = pick(ROLES);
      const hours = pick([5, 5.5, 6, 6, 6.5, 7, 7, 8, 8, 10]); // doubles sometimes
      const isWeekend = dayOffset === 5 || dayOffset === 6;
      const isBartender = role === 'Bartender';

      // Tips vary: weekends and bartenders earn more
      const baseTips = randInt(60, 130);
      const weekendBonus = isWeekend ? randInt(20, 60) : 0;
      const bartenderBonus = isBartender ? randInt(15, 40) : 0;
      const tips = baseTips + weekendBonus + bartenderBonus;

      const cashTips = Math.round(tips * (rand() * 0.4 + 0.1)); // 10-50% cash
      const creditTips = tips - cashTips;

      const tipOutPercent = randInt(2, 5);
      const tipOut = Math.round(tips * tipOutPercent / 100);

      const totalSales = Math.round(tips / (rand() * 0.08 + 0.15)); // 15-23% tip rate
      const totalEarned = +(hours * WAGE + tips - tipOut).toFixed(2);

      // Add 0-2 tags
      const numTags = randInt(0, 2);
      const tags: string[] = [];
      if (numTags > 0) {
        if (isWeekend && rand() > 0.5) tags.push('Busy');
        else if (rand() > 0.7) tags.push(pick(['Slow', 'Busy']));
        if (hours >= 10) tags.push('Double');
        if (tags.length < numTags && rand() > 0.5) tags.push(pick(['Patio', 'Bar', 'Event']));
      }

      shifts.push({
        id: seedId(),
        date: dateISO,
        displayDate: formatDisplayDate(dateISO),
        hours,
        totalEarned,
        tips,
        tipOut,
        hourlyWage: WAGE,
        shiftTime: pick(SHIFT_TIMES),
        role,
        cashTips,
        creditTips,
        notes: rand() > 0.8 ? pick(['Great night!', 'Slow start but picked up', 'Big party of 12', 'Cut early', 'Covered for Mike']) : undefined,
        tags,
        totalSales,
        tipOutMode: 'percent',
        tipOutPercent,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Sort shifts by date
  shifts.sort((a, b) => a.date.localeCompare(b.date));

  // Generate upcoming scheduled shifts (next 7 days)
  const schedule: ScheduledShift[] = [];
  for (let daysAhead = 1; daysAhead <= 7; daysAhead++) {
    if (rand() > 0.55) { // ~45% chance of work each day
      const dateISO = addDays(todayISO, daysAhead);
      const role = pick(ROLES);
      const startTime = pick(['11:00 AM', '3:00 PM', '4:00 PM', '5:00 PM']);
      schedule.push({
        id: seedId(),
        date: dateISO,
        displayDate: formatDisplayDate(dateISO),
        dayOfWeek: getDayOfWeek(dateISO),
        startTime,
        role,
        estimatedHours: pick([5, 6, 6, 7, 8]),
        logged: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Generate expenses (past month)
  const expenses: Expense[] = [];
  const expenseItems: { cat: Expense['category']; desc: string; min: number; max: number }[] = [
    { cat: 'mileage', desc: 'Commute to restaurant', min: 5, max: 15 },
    { cat: 'uniform', desc: 'New black apron', min: 15, max: 35 },
    { cat: 'uniform', desc: 'Non-slip shoes', min: 45, max: 80 },
    { cat: 'supplies', desc: 'Wine key & pen set', min: 8, max: 20 },
    { cat: 'supplies', desc: 'Server book', min: 12, max: 25 },
    { cat: 'other', desc: 'Food handler certification', min: 25, max: 40 },
  ];
  for (let i = 0; i < 5; i++) {
    const item = pick(expenseItems);
    const daysAgo = randInt(1, 35);
    const dateISO = addDays(todayISO, -daysAgo);
    expenses.push({
      id: seedId(),
      date: dateISO,
      category: item.cat,
      amount: randInt(item.min, item.max),
      description: item.desc,
      createdAt: now,
    });
  }

  // Goals
  const goals: Goal[] = [
    { id: seedId(), type: 'daily', target: 150, isActive: true, createdAt: now },
    { id: seedId(), type: 'weekly', target: 800, isActive: true, createdAt: now },
    { id: seedId(), type: 'monthly', target: 3200, isActive: true, createdAt: now },
  ];

  return {
    shifts,
    schedule,
    jobs: [],
    expenses,
    goals,
    clients: [],
    settings: {
      ...DEFAULT_SETTINGS,
      enableTaxTracking: true,
      taxFilingStatus: 'single',
      stateTaxRate: 5.0,
      appearance: 'dark',
      accentColor: 'green',
      lastRole: 'Server',
      lastTipOutMode: 'percent',
      lastTipOutPercent: 3,
    },
    version: 2,
    updatedAt: now,
    hasSeenOnboarding: true,
    isNewCustomerMode: false,
  };
}
