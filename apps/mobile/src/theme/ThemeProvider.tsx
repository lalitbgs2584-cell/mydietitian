import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors } from './colors';
import { fonts, fontSize } from './typography';
import { spacing, radius, shadow } from './spacing';

type Mode = 'light' | 'dark';
type Theme = { mode: Mode; colors: ThemeColors; fonts: typeof fonts; fontSize: typeof fontSize; spacing: typeof spacing; radius: typeof radius; shadow: typeof shadow };
type Ctx = Theme & { toggle: () => void; setMode: (m: Mode) => void };

const KEY = 'theme-mode';
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const system = useColorScheme();
    const [mode, setModeState] = useState<Mode>('dark'); // app is dark-first

    useEffect(() => {
        AsyncStorage.getItem(KEY).then((v) => {
            if (v === 'light' || v === 'dark') setModeState(v);
            else if (system === 'light' || system === 'dark') setModeState(system);
        });
    }, [system]);

    const setMode = useCallback((m: Mode) => { setModeState(m); AsyncStorage.setItem(KEY, m); }, []);
    const toggle = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode]);

    const value = useMemo<Ctx>(() => ({
        mode, colors: mode === 'dark' ? darkColors : lightColors,
        fonts, fontSize, spacing, radius, shadow, toggle, setMode,
    }), [mode, toggle, setMode]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const c = useContext(ThemeContext);
    if (!c) throw new Error('useTheme must be used inside ThemeProvider');
    return c;
};

