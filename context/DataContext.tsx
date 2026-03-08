import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppData, Shift, ScheduledShift, Settings } from '../lib/types';
import { Storage } from '../lib/storage';
import { DEFAULT_APP_DATA } from '../lib/constants';
import { generateId, formatDisplayDate, getDayOfWeek } from '../lib/helpers';

interface DataContextType {
  data: AppData;
  loading: boolean;
  addShift: (date: string, hours: number, tips: number, tipOut: number) => void;
  updateShift: (id: string, date: string, hours: number, tips: number, tipOut: number) => void;
  deleteShift: (id: string) => void;
  addScheduledShift: (date: string, startTime: string, role: string, estimatedHours: number) => void;
  addScheduledShifts: (shifts: { date: string; startTime: string; role: string; estimatedHours: number }[]) => void;
  updateScheduledShift: (id: string, updates: Partial<ScheduledShift>) => void;
  deleteScheduledShift: (id: string) => void;
  logScheduledShift: (scheduleId: string, hours: number, tips: number, tipOut: number) => void;
  unlogScheduledShift: (scheduleId: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  clearAllData: () => Promise<void>;
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

  const addShift = useCallback((date: string, hours: number, tips: number, tipOut: number) => {
    const wage = data.settings.hourlyWage;
    const shift: Shift = {
      id: generateId(),
      date,
      displayDate: formatDisplayDate(date),
      hours,
      totalEarned: +(hours * wage + tips - tipOut).toFixed(2),
      tips,
      tipOut,
      hourlyWage: wage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save({ ...data, shifts: [...data.shifts, shift] });
  }, [data, save]);

  const updateShift = useCallback((id: string, date: string, hours: number, tips: number, tipOut: number) => {
    save({
      ...data,
      shifts: data.shifts.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          date,
          displayDate: formatDisplayDate(date),
          hours,
          tips,
          tipOut,
          totalEarned: +(hours * s.hourlyWage + tips - tipOut).toFixed(2),
          updatedAt: new Date().toISOString(),
        };
      }),
    });
  }, [data, save]);

  const deleteShift = useCallback((id: string) => {
    save({ ...data, shifts: data.shifts.filter(s => s.id !== id) });
  }, [data, save]);

  const addScheduledShift = useCallback((date: string, startTime: string, role: string, estimatedHours: number) => {
    const entry: ScheduledShift = {
      id: generateId(),
      date,
      displayDate: formatDisplayDate(date),
      dayOfWeek: getDayOfWeek(date),
      startTime,
      role,
      estimatedHours,
      logged: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save({ ...data, schedule: [...data.schedule, entry] });
  }, [data, save]);

  const addScheduledShifts = useCallback((shifts: { date: string; startTime: string; role: string; estimatedHours: number }[]) => {
    const existing = data.schedule;
    const newEntries: ScheduledShift[] = [];
    for (const shift of shifts) {
      // Skip if a shift with the same date and startTime already exists in DB or in this batch
      const isDupInDB = existing.some(e => e.date === shift.date && e.startTime === shift.startTime);
      const isDupInBatch = newEntries.some(e => e.date === shift.date && e.startTime === shift.startTime);
      if (isDupInDB || isDupInBatch) continue;
      newEntries.push({
        id: generateId(),
        date: shift.date,
        displayDate: formatDisplayDate(shift.date),
        dayOfWeek: getDayOfWeek(shift.date),
        startTime: shift.startTime,
        role: shift.role,
        estimatedHours: shift.estimatedHours,
        logged: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    // Auto-add any new roles found in ALL incoming shifts (not just non-dupes)
    const currentRoles = data.settings.roles;
    const newRoles = [...new Set(
      shifts
        .map(s => s.role)
        .filter(r => r && r !== 'Unknown' && !currentRoles.includes(r))
    )];
    const updatedSettings = newRoles.length > 0
      ? { ...data.settings, roles: [...currentRoles, ...newRoles] }
      : data.settings;

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
        if (updates.date) {
          updated.displayDate = formatDisplayDate(updates.date);
          updated.dayOfWeek = getDayOfWeek(updates.date);
        }
        return updated;
      }),
    });
  }, [data, save]);

  const deleteScheduledShift = useCallback((id: string) => {
    save({ ...data, schedule: data.schedule.filter(s => s.id !== id) });
  }, [data, save]);

  const logScheduledShift = useCallback((scheduleId: string, hours: number, tips: number, tipOut: number) => {
    const entry = data.schedule.find(s => s.id === scheduleId);
    if (!entry) return;

    const wage = data.settings.roleWages?.[entry.role] ?? data.settings.hourlyWage;
    const shift: Shift = {
      id: generateId(),
      date: entry.date,
      displayDate: entry.displayDate,
      hours,
      totalEarned: +(hours * wage + tips - tipOut).toFixed(2),
      tips,
      tipOut,
      hourlyWage: wage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    save({
      ...data,
      shifts: [...data.shifts, shift],
      schedule: data.schedule.map(s =>
        s.id === scheduleId ? { ...s, logged: true, loggedShiftId: shift.id, updatedAt: new Date().toISOString() } : s
      ),
    });
  }, [data, save]);

  const unlogScheduledShift = useCallback((scheduleId: string) => {
    const entry = data.schedule.find(s => s.id === scheduleId);
    if (!entry || !entry.logged) return;

    // Remove the linked shift and reset the scheduled shift
    const shiftsWithout = entry.loggedShiftId
      ? data.shifts.filter(s => s.id !== entry.loggedShiftId)
      : data.shifts;

    save({
      ...data,
      shifts: shiftsWithout,
      schedule: data.schedule.map(s =>
        s.id === scheduleId
          ? { ...s, logged: false, loggedShiftId: undefined, updatedAt: new Date().toISOString() }
          : s
      ),
    });
  }, [data, save]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    save({ ...data, settings: { ...data.settings, ...updates } });
  }, [data, save]);

  const clearAllData = useCallback(async () => {
    const preserved = {
      geminiApiKey: data.settings.geminiApiKey,
      roles: data.settings.roles,
      roleWages: data.settings.roleWages,
      hourlyWage: data.settings.hourlyWage,
      defaultShiftHours: data.settings.defaultShiftHours,
    };
    const cleared = {
      ...DEFAULT_APP_DATA,
      settings: { ...DEFAULT_APP_DATA.settings, ...preserved },
      updatedAt: new Date().toISOString(),
    };
    setData(cleared);
    await Storage.set(cleared);
  }, [data.settings]);

  return (
    <DataContext.Provider value={{
      data, loading,
      addShift, updateShift, deleteShift,
      addScheduledShift, addScheduledShifts, updateScheduledShift, deleteScheduledShift, logScheduledShift, unlogScheduledShift,
      updateSettings, clearAllData,
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
