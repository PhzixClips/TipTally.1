import { supabase, isSupabaseConfigured } from './supabase';
import { Shift, ScheduledShift, AppData } from './types';

export async function pushShifts(shifts: Shift[]): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const shift of shifts) {
    await supabase.from('shifts').upsert({
      id: shift.id,
      user_id: user.id,
      date: shift.date,
      display_date: shift.displayDate,
      hours: shift.hours,
      total_earned: shift.totalEarned,
      tips: shift.tips,
      hourly_wage: shift.hourlyWage,
      created_at: shift.createdAt,
      updated_at: shift.updatedAt,
    });
  }
}

export async function pullShifts(lastSyncedAt: string | null): Promise<Shift[]> {
  if (!supabase || !isSupabaseConfigured()) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('shifts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  if (lastSyncedAt) {
    query = query.gt('updated_at', lastSyncedAt);
  }

  const { data } = await query;
  if (!data) return [];

  return data.map(row => ({
    id: row.id,
    date: row.date,
    displayDate: row.display_date,
    hours: row.hours,
    totalEarned: row.total_earned,
    tips: row.tips,
    hourlyWage: row.hourly_wage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function pushSchedule(schedule: ScheduledShift[]): Promise<void> {
  if (!supabase || !isSupabaseConfigured()) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const entry of schedule) {
    await supabase.from('scheduled_shifts').upsert({
      id: entry.id,
      user_id: user.id,
      date: entry.date,
      display_date: entry.displayDate,
      day_of_week: entry.dayOfWeek,
      start_time: entry.startTime,
      role: entry.role,
      estimated_hours: entry.estimatedHours,
      logged: entry.logged,
      logged_shift_id: entry.loggedShiftId || null,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    });
  }
}

export async function pullSchedule(lastSyncedAt: string | null): Promise<ScheduledShift[]> {
  if (!supabase || !isSupabaseConfigured()) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('scheduled_shifts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null);

  if (lastSyncedAt) {
    query = query.gt('updated_at', lastSyncedAt);
  }

  const { data } = await query;
  if (!data) return [];

  return data.map(row => ({
    id: row.id,
    date: row.date,
    displayDate: row.display_date,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    role: row.role,
    estimatedHours: row.estimated_hours,
    logged: row.logged,
    loggedShiftId: row.logged_shift_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function fullSync(appData: AppData): Promise<{ shifts: Shift[]; schedule: ScheduledShift[] } | null> {
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    // Push local data
    await pushShifts(appData.shifts);
    await pushSchedule(appData.schedule);

    // Pull remote data
    const remoteShifts = await pullShifts(appData.settings.lastSyncedAt);
    const remoteSchedule = await pullSchedule(appData.settings.lastSyncedAt);

    // Merge: last-write-wins
    const mergedShifts = mergeRecords(appData.shifts, remoteShifts);
    const mergedSchedule = mergeRecords(appData.schedule, remoteSchedule);

    return { shifts: mergedShifts, schedule: mergedSchedule };
  } catch {
    return null;
  }
}

function mergeRecords<T extends { id: string; updatedAt: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();

  for (const item of local) {
    map.set(item.id, item);
  }

  for (const item of remote) {
    const existing = map.get(item.id);
    if (!existing || item.updatedAt > existing.updatedAt) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}
