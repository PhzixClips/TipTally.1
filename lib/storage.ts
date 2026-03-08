import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from './types';
import { STORAGE_KEY, DEFAULT_APP_DATA } from './constants';

function migrateV1toV2(data: any): any {
  const shifts = (data.shifts || []).map((s: any) => ({
    tipOut: 0,
    tags: [],
    ...s,
  }));
  return {
    ...data,
    shifts,
    jobs: data.jobs || [],
    expenses: data.expenses || [],
    goals: data.goals || [],
    clients: data.clients || [],
    version: 2,
  };
}

export const Storage = {
  get: async (): Promise<AppData> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        let data = JSON.parse(raw);
        if (!data.version || data.version < 2) {
          data = migrateV1toV2(data);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, updatedAt: new Date().toISOString() }));
        }
        return {
          ...DEFAULT_APP_DATA,
          ...data,
          shifts: (data.shifts || []).map((s: any) => ({ tipOut: 0, tags: [], ...s })),
          settings: { ...DEFAULT_APP_DATA.settings, ...data.settings },
          jobs: data.jobs || [],
          expenses: data.expenses || [],
          goals: data.goals || [],
          clients: data.clients || [],
        };
      }
    } catch {}
    return { ...DEFAULT_APP_DATA, updatedAt: new Date().toISOString() };
  },

  set: async (data: AppData): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...data, updatedAt: new Date().toISOString() })
      );
    } catch {}
  },

  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
