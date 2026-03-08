import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppData, Shift, ShiftExtras, ScheduledShift, Settings, Job, Expense, Goal, Client } from '../lib/types';
import { Storage } from '../lib/storage';
import { DEFAULT_APP_DATA } from '../lib/constants';
import { generateId, formatDisplayDate, getDayOfWeek } from '../lib/helpers';

interface DataContextType {
  data: AppData;
  loading: boolean;
  addShift: (date: string, hours: number, tips: number, tipOut: number, extras?: ShiftExtras) => void;
  updateShift: (id: string, date: string, hours: number, tips: number, tipOut: number, extras?: ShiftExtras) => void;
  deleteShift: (id: string) => void;
  addScheduledShift: (date: string, startTime: string, role: string, estimatedHours: number) => void;
  addScheduledShifts: (shifts: { date: string; startTime: string; role: string; estimatedHours: number }[]) => void;
  updateScheduledShift: (id: string, updates: Partial<ScheduledShift>) => void;
  deleteScheduledShift: (id: string) => void;
  logScheduledShift: (scheduleId: string, hours: number, tips: number, tipOut: number, extras?: ShiftExtras) => void;
  unlogScheduledShift: (scheduleId: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  clearAllData: () => Promise<void>;
  setNewCustomerMode: (enabled: boolean) => void;
  markOnboardingSeen: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await Storage.get();
      setData(loaded);
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (newData: AppData) => {
    const sorted = {
      ...newData,
      shifts: [...newData.shifts].sort((a, b) => a.date.localeCompare(b.date)),
      schedule: [...newData.schedule].sort((a, b) => a.date.localeCompare(b.date)),
    };
    setData(sorted);
    await Storage.set(sorted);
  }, []);

  const addShift = useCallback((date: string, hours: number, tips: number, tipOut: number, extras?: ShiftExtras) => {
    const role = extras?.role;
    const wage = (role && data.settings.roleWages?.[role]) || data.settings.hourlyWage;
    const now = new Date().toISOString();
    const shift: Shift = {
      id: generateId(), date, displayDate: formatDisplayDate(date), hours,
      totalEarned: +(hours * wage + tips - tipOut).toFixed(2),
      tips, tipOut, hourlyWage: wage,
      role: extras?.role, cashTips: extras?.cashTips, creditTips: extras?.creditTips,
      notes: extras?.notes, tags: extras?.tags || [],
      totalSales: extras?.totalSales, tipOutMode: extras?.tipOutMode, tipOutPercent: extras?.tipOutPercent,
      jobId: extras?.jobId || data.settings.activeJobId, clientId: extras?.clientId,
      createdAt: now, updatedAt: now,
    };
    const settingsUpdates: Partial<Settings> = {};
    if (extras?.tipOutMode) settingsUpdates.lastTipOutMode = extras.tipOutMode;
    if (extras?.tipOutPercent != null) settingsUpdates.lastTipOutPercent = extras.tipOutPercent;
    if (extras?.role) settingsUpdates.lastRole = extras.role;
    save({ ...data, shifts: [...data.shifts, shift], settings: { ...data.settings, ...settingsUpdates } });
  }, [data, save]);

  const updateShift = useCallback((id: string, date: string, hours: number, tips: number, tipOut: number, extras?: ShiftExtras) => {
    save({
      ...data,
      shifts: data.shifts.map(s => {
        if (s.id !== id) return s;
        const role = extras?.role || s.role;
        const wage = (role && data.settings.roleWages?.[role]) || s.hourlyWage;
        return {
          ...s, date, displayDate: formatDisplayDate(date), hours, tips, tipOut,
          hourlyWage: wage, totalEarned: +(hours * wage + tips - tipOut).toFixed(2),
          role: extras?.role ?? s.role, cashTips: extras?.cashTips ?? s.cashTips,
          creditTips: extras?.creditTips ?? s.creditTips, notes: extras?.notes ?? s.notes,
          tags: extras?.tags ?? s.tags, totalSales: extras?.totalSales ?? s.totalSales,
          tipOutMode: extras?.tipOutMode ?? s.tipOutMode, tipOutPercent: extras?.tipOutPercent ?? s.tipOutPercent,
          jobId: extras?.jobId ?? s.jobId, clientId: extras?.clientId ?? s.clientId,
          updatedAt: new Date().toISOString(),
        };
      }),
    });
  }, [data, save]);

  const deleteShift = useCallback((id: string) => {
    save({ ...data, shifts: data.shifts.filter(s => s.id !== id) });
  }, [data, save]);

  const addScheduledShift = useCallback((date: string, startTime: string, role: string, estimatedHours: number) => {
    const now = new Date().toISOString();
    const entry: ScheduledShift = {
      id: generateId(), date, displayDate: formatDisplayDate(date),
      dayOfWeek: getDayOfWeek(date), startTime, role, estimatedHours,
      logged: false, createdAt: now, updatedAt: now,
    };
    save({ ...data, schedule: [...data.schedule, entry] });
  }, [data, save]);

  const addScheduledShifts = useCallback((shifts: { date: string; startTime: string; role: string; estimatedHours: number }[]) => {
    const existing = data.schedule;
    const newEntries: ScheduledShift[] = [];
    const now = new Date().toISOString();
    for (const shift of shifts) {
      const isDupInDB = existing.some(e => e.date === shift.date && e.startTime === shift.startTime);
      const isDupInBatch = newEntries.some(e => e.date === shift.date && e.startTime === shift.startTime);
      if (isDupInDB || isDupInBatch) continue;
      newEntries.push({
        id: generateId(), date: shift.date, displayDate: formatDisplayDate(shift.date),
        dayOfWeek: getDayOfWeek(shift.date), startTime: shift.startTime, role: shift.role,
        estimatedHours: shift.estimatedHours, logged: false, createdAt: now, updatedAt: now,
      });
    }
    const currentRoles = data.settings.roles;
    const newRoles = [...new Set(shifts.map(s => s.role).filter(r => r && r !== 'Unknown' && !currentRoles.includes(r)))];
    const updatedSettings = newRoles.length > 0 ? { ...data.settings, roles: [...currentRoles, ...newRoles] } : data.settings;
    if (newEntries.length > 0 || newRoles.length > 0) {
      save({ ...data, settings: updatedSettings, schedule: [...data.schedule, ...newEntries] });
    }
  }, [data, save]);

  const updateScheduledShift = useCallback((id: string, updates: Partial<ScheduledShift>) => {
    save({
      ...data,
      schedule: data.schedule.map(s => {
        if (s.id !== id) return s;
        const updated = { ...s, ...updates, updatedAt: new Date().toISOString() };
        if (updates.date) { updated.displayDate = formatDisplayDate(updates.date); updated.dayOfWeek = getDayOfWeek(updates.date); }
        return updated;
      }),
    });
  }, [data, save]);

  const deleteScheduledShift = useCallback((id: string) => {
    save({ ...data, schedule: data.schedule.filter(s => s.id !== id) });
  }, [data, save]);

  const logScheduledShift = useCallback((scheduleId: string, hours: number, tips: number, tipOut: number, extras?: ShiftExtras) => {
    const entry = data.schedule.find(s => s.id === scheduleId);
    if (!entry) return;
    const wage = data.settings.roleWages?.[entry.role] ?? data.settings.hourlyWage;
    const now = new Date().toISOString();
    const shift: Shift = {
      id: generateId(), date: entry.date, displayDate: entry.displayDate, hours,
      totalEarned: +(hours * wage + tips - tipOut).toFixed(2), tips, tipOut, hourlyWage: wage,
      role: extras?.role || entry.role, cashTips: extras?.cashTips, creditTips: extras?.creditTips,
      notes: extras?.notes, tags: extras?.tags || [], jobId: extras?.jobId || data.settings.activeJobId,
      createdAt: now, updatedAt: now,
    };
    save({
      ...data, shifts: [...data.shifts, shift],
      schedule: data.schedule.map(s => s.id === scheduleId ? { ...s, logged: true, loggedShiftId: shift.id, updatedAt: now } : s),
    });
  }, [data, save]);

  const unlogScheduledShift = useCallback((scheduleId: string) => {
    const entry = data.schedule.find(s => s.id === scheduleId);
    if (!entry || !entry.logged) return;
    const shiftsWithout = entry.loggedShiftId ? data.shifts.filter(s => s.id !== entry.loggedShiftId) : data.shifts;
    save({
      ...data, shifts: shiftsWithout,
      schedule: data.schedule.map(s => s.id === scheduleId ? { ...s, logged: false, loggedShiftId: undefined, updatedAt: new Date().toISOString() } : s),
    });
  }, [data, save]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    save({ ...data, settings: { ...data.settings, ...updates } });
  }, [data, save]);

  // Jobs
  const addJob = useCallback((job: Omit<Job, 'id' | 'createdAt'>) => {
    save({ ...data, jobs: [...data.jobs, { ...job, id: generateId(), createdAt: new Date().toISOString() }] });
  }, [data, save]);
  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    save({ ...data, jobs: data.jobs.map(j => j.id === id ? { ...j, ...updates } : j) });
  }, [data, save]);
  const deleteJob = useCallback((id: string) => {
    save({ ...data, jobs: data.jobs.filter(j => j.id !== id) });
  }, [data, save]);

  // Expenses
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    save({ ...data, expenses: [...data.expenses, { ...expense, id: generateId(), createdAt: new Date().toISOString() }] });
  }, [data, save]);
  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    save({ ...data, expenses: data.expenses.map(e => e.id === id ? { ...e, ...updates } : e) });
  }, [data, save]);
  const deleteExpense = useCallback((id: string) => {
    save({ ...data, expenses: data.expenses.filter(e => e.id !== id) });
  }, [data, save]);

  // Goals
  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    save({ ...data, goals: [...data.goals, { ...goal, id: generateId(), createdAt: new Date().toISOString() }] });
  }, [data, save]);
  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    save({ ...data, goals: data.goals.map(g => g.id === id ? { ...g, ...updates } : g) });
  }, [data, save]);
  const deleteGoal = useCallback((id: string) => {
    save({ ...data, goals: data.goals.filter(g => g.id !== id) });
  }, [data, save]);

  // Clients
  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt'>) => {
    save({ ...data, clients: [...data.clients, { ...client, id: generateId(), createdAt: new Date().toISOString() }] });
  }, [data, save]);
  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    save({ ...data, clients: data.clients.map(c => c.id === id ? { ...c, ...updates } : c) });
  }, [data, save]);
  const deleteClient = useCallback((id: string) => {
    save({ ...data, clients: data.clients.filter(c => c.id !== id) });
  }, [data, save]);

  // Data management
  const clearAllData = useCallback(async () => {
    const preserved = {
      geminiApiKey: data.settings.geminiApiKey, roles: data.settings.roles,
      roleWages: data.settings.roleWages, hourlyWage: data.settings.hourlyWage,
      defaultShiftHours: data.settings.defaultShiftHours,
    };
    const cleared: AppData = { ...DEFAULT_APP_DATA, settings: { ...DEFAULT_APP_DATA.settings, ...preserved }, updatedAt: new Date().toISOString() };
    setData(cleared);
    await Storage.set(cleared);
  }, [data.settings]);

  const setNewCustomerMode = useCallback((enabled: boolean) => {
    save({ ...data, isNewCustomerMode: enabled, hasSeenOnboarding: enabled ? false : data.hasSeenOnboarding });
  }, [data, save]);

  const markOnboardingSeen = useCallback(() => {
    save({ ...data, hasSeenOnboarding: true });
  }, [data, save]);

  return (
    <DataContext.Provider value={{
      data, loading,
      addShift, updateShift, deleteShift,
      addScheduledShift, addScheduledShifts, updateScheduledShift, deleteScheduledShift, logScheduledShift, unlogScheduledShift,
      updateSettings,
      addJob, updateJob, deleteJob,
      addExpense, updateExpense, deleteExpense,
      addGoal, updateGoal, deleteGoal,
      addClient, updateClient, deleteClient,
      clearAllData, setNewCustomerMode, markOnboardingSeen,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
