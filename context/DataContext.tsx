import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppData, Shift, ScheduledShift, Settings } from '../lib/types';
import { Storage } from '../lib/storage';
import { DEFAULT_APP_DATA } from '../lib/constants';
import { generateId, formatDisplayDate, getDayOfWeek, calculateTips } from '../lib/helpers';

interface DataContextType {
  data: AppData;
  loading: boolean;
  addShift: (date: string, hours: number, totalEarned: number) => void;
  updateShift: (id: string, date: string, hours: number, totalEarned: number) => void;
  deleteShift: (id: string) => void;
  addScheduledShift: (date: string, startTime: string, role: string, estimatedHours: number) => void;
  updateScheduledShift: (id: string, updates: Partial<ScheduledShift>) => void;
  deleteScheduledShift: (id: string) => void;
  logScheduledShift: (scheduleId: string, hours: number, totalEarned: number) => void;
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
    setData(newData);
    await Storage.set(newData);
  }, []);

  const addShift = useCallback((date: string, hours: number, totalEarned: number) => {
    const wage = data.settings.hourlyWage;
    const shift: Shift = {
      id: generateId(),
      date,
      displayDate: formatDisplayDate(date),
      hours,
      totalEarned,
      tips: calculateTips(totalEarned, hours, wage),
      hourlyWage: wage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save({ ...data, shifts: [...data.shifts, shift] });
  }, [data, save]);

  const updateShift = useCallback((id: string, date: string, hours: number, totalEarned: number) => {
    save({
      ...data,
      shifts: data.shifts.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          date,
          displayDate: formatDisplayDate(date),
          hours,
          totalEarned,
          tips: calculateTips(totalEarned, hours, s.hourlyWage),
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

  const logScheduledShift = useCallback((scheduleId: string, hours: number, totalEarned: number) => {
    const entry = data.schedule.find(s => s.id === scheduleId);
    if (!entry) return;

    const wage = data.settings.hourlyWage;
    const shift: Shift = {
      id: generateId(),
      date: entry.date,
      displayDate: entry.displayDate,
      hours,
      totalEarned,
      tips: calculateTips(totalEarned, hours, wage),
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

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    save({ ...data, settings: { ...data.settings, ...updates } });
  }, [data, save]);

  const clearAllData = useCallback(async () => {
    await Storage.clear();
    setData({ ...DEFAULT_APP_DATA, updatedAt: new Date().toISOString() });
  }, []);

  return (
    <DataContext.Provider value={{
      data, loading,
      addShift, updateShift, deleteShift,
      addScheduledShift, updateScheduledShift, deleteScheduledShift, logScheduledShift,
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
