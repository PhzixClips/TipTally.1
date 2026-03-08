import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData } from './types';
import { STORAGE_KEY, DEFAULT_APP_DATA } from './constants';

export const Storage = {
  get: async (): Promise<AppData> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as AppData;
        return {
          ...DEFAULT_APP_DATA,
          ...data,
          settings: { ...DEFAULT_APP_DATA.settings, ...data.settings },
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
