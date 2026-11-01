import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { Appearance } from 'react-native';
import { darkColors, lightColors, ThemeColors } from './colors';
import { fonts, fontSize } from './typography';
import { spacing, radius, shadow, sizes } from './spacing';
import { usePrefsStore, type ThemeMode } from '@/store/prefs.store';

type Mode = ThemeMode;
type Theme = { mode: Mode; colors: ThemeColors; fonts: typeof fonts; fontSize: typeof fontSize; spacing: typeof spacing; radius: typeof radius; shadow: typeof shadow; sizes: typeof sizes };
type Ctx = Theme & { toggle: () => void; setMode: (m: Mode) => void };

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const savedMode = usePrefsStore((state) => state.themeMode)
    const updateMode = usePrefsStore((state) => state.setThemeMode)
    const mode: Mode = savedMode ?? 'dark'
    const hydrated = usePrefsStore((state) => state.hydrated)

    useEffect(() => {
        if (hydrated) Appearance.setColorScheme(mode)
    }, [hydrated, mode])

    const setMode = useCallback((value: Mode) => { updateMode(value) }, [updateMode]);
    const toggle = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode]);

    const value = useMemo<Ctx>(() => ({
        mode, colors: mode === 'dark' ? darkColors : lightColors,
        fonts, fontSize, spacing, radius, shadow, sizes, toggle, setMode,
    }), [mode, toggle, setMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const c = useContext(ThemeContext);
    if (!c) throw new Error('useTheme must be used inside ThemeProvider');
    return c;
};
