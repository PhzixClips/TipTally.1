import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Appearance = 'light' | 'dark' | 'system';
type AccentColor = 'green' | 'yellow' | 'blue' | 'purple' | 'coral';

interface ThemeColors {
  bg: string; card: string; cardHover: string; surface: string;
  border: string; borderLight: string;
  text: string; textSoft: string; textMuted: string; textFaint: string;
}

interface AccentColors {
  primary: string; soft: string; bg: string; border: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  accent: AccentColors;
  isDark: boolean;
  appearance: Appearance;
  accentColor: AccentColor;
  setAppearance: (a: Appearance) => void;
  setAccentColor: (c: AccentColor) => void;
}

const STORAGE_KEY = 'tiptally-theme';

const lightPalette: ThemeColors = {
  bg: '#F5F5F7',
  card: '#FFFFFF',
  cardHover: '#F0F0F2',
  surface: '#F8F8FA',
  border: '#E5E5EA',
  borderLight: '#D1D1D6',
  text: '#1C1C1E',
  textSoft: '#3A3A3C',
  textMuted: '#8E8E93',
  textFaint: '#C7C7CC',
};

const darkPalette: ThemeColors = {
  bg: '#0B0F14',
  card: '#141A23',
  cardHover: '#1A2230',
  surface: '#111820',
  border: '#1E2A38',
  borderLight: '#2A3A4D',
  text: '#F0F4F8',
  textSoft: '#B0BEC8',
  textMuted: '#6B7D8E',
  textFaint: '#3E4F5F',
};

const accentColors: Record<AccentColor, { light: AccentColors; dark: AccentColors }> = {
  green: {
    light: { primary: '#00C853', soft: '#00A844', bg: '#00C85315', border: '#00C85330' },
    dark: { primary: '#00FF88', soft: '#00A844', bg: '#00C85315', border: '#00C85330' },
  },
  yellow: {
    light: { primary: '#FFD166', soft: '#E6B84D', bg: '#FFD16615', border: '#FFD16630' },
    dark: { primary: '#FFD166', soft: '#E6B84D', bg: '#FFD16615', border: '#FFD16630' },
  },
  blue: {
    light: { primary: '#6CB4FF', soft: '#5A9CE6', bg: '#6CB4FF15', border: '#6CB4FF30' },
    dark: { primary: '#6CB4FF', soft: '#5A9CE6', bg: '#6CB4FF15', border: '#6CB4FF30' },
  },
  purple: {
    light: { primary: '#B18CFF', soft: '#9E7AE6', bg: '#B18CFF15', border: '#B18CFF30' },
    dark: { primary: '#B18CFF', soft: '#9E7AE6', bg: '#B18CFF15', border: '#B18CFF30' },
  },
  coral: {
    light: { primary: '#FF7A7A', soft: '#E66B6B', bg: '#FF7A7A15', border: '#FF7A7A30' },
    dark: { primary: '#FF7A7A', soft: '#E66B6B', bg: '#FF7A7A15', border: '#FF7A7A30' },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<Appearance>('dark');
  const [accentColor, setAccentColorState] = useState<AccentColor>('green');
  const [loaded, setLoaded] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.appearance) setAppearanceState(parsed.appearance);
          if (parsed.accentColor) setAccentColorState(parsed.accentColor);
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  // Persist whenever values change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ appearance, accentColor }));
  }, [appearance, accentColor, loaded]);

  const setAppearance = (a: Appearance) => setAppearanceState(a);
  const setAccentColor = (c: AccentColor) => setAccentColorState(c);

  const isDark =
    appearance === 'dark' ||
    (appearance === 'system' && systemScheme !== 'light');

  const colors = isDark ? darkPalette : lightPalette;
  const accent = isDark
    ? accentColors[accentColor].dark
    : accentColors[accentColor].light;

  return (
    <ThemeContext.Provider
      value={{ colors, accent, isDark, appearance, accentColor, setAppearance, setAccentColor }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
