import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from '../constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

const MODE_KEY = 'gig_theme_mode_v1';
const ORDER: ThemeMode[] = ['system', 'light', 'dark'];

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  scheme: 'light' | 'dark'; // the resolved scheme actually in use
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY).then((stored) => {
      if (stored === 'system' || stored === 'light' || stored === 'dark') {
        setModeState(stored);
      }
    });
  }, []);

  function setMode(next: ThemeMode) {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next);
  }

  function cycleMode() {
    setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
  }

  const scheme: 'light' | 'dark' = mode === 'system' ? (system ?? 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: scheme === 'dark' ? darkTheme : lightTheme,
      mode,
      scheme,
      setMode,
      cycleMode,
    }),
    [scheme, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The active theme (colors + spacing/radius/font). Re-renders on mode change. */
export function useTheme(): AppTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx.theme;
}

/** Mode controls for the toggle. */
export function useThemeMode(): Pick<ThemeContextValue, 'mode' | 'scheme' | 'setMode' | 'cycleMode'> {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  const { mode, scheme, setMode, cycleMode } = ctx;
  return { mode, scheme, setMode, cycleMode };
}
