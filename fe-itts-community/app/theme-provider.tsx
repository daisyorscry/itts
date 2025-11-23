// app/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Mode = 'light' | 'dark' | 'system';
type ThemeCtx = {
  mode: Mode;                 // preferensi user
  theme: 'light' | 'dark';    // hasil efektif
  setMode: (m: Mode) => void;
  cycle: () => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function detectSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({
  children,
  initialMode,
}: {
  children: React.ReactNode;
  initialMode: Mode; // datang dari SSR cookie
}) {
  const [mode, setModeState] = useState<Mode>(initialMode);
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : detectSystemDark()
  );

  // apply ke DOM + simpan cookie + localStorage
  const setMode = (m: Mode) => {
    setModeState(m);

    if (m === 'light' || m === 'dark') {
      document.documentElement.setAttribute('data-theme', m);
    } else {
      document.documentElement.removeAttribute('data-theme'); // kembali ke system
    }

    // persist browser & SSR selanjutnya
    try {
      localStorage.setItem('theme', m);
      document.cookie = `theme=${m}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  };

  // responsif ke perubahan OS saat mode=system
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const theme: 'light' | 'dark' = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  const cycle = () => setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');

  const value = useMemo<ThemeCtx>(() => ({ mode, theme, setMode, cycle }), [mode, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
