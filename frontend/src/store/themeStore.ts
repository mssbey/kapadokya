import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  loadTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (resolved === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  resolvedTheme: 'dark',

  setTheme: (theme) => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    localStorage.setItem('dc_theme', theme);
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  loadTheme: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('dc_theme') as Theme | null;
    const theme = stored || 'dark';
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    applyTheme(resolved);
    set({ theme, resolvedTheme: resolved });

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const current = get().theme;
      if (current === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        applyTheme(newResolved);
        set({ resolvedTheme: newResolved });
      }
    };
    mql.addEventListener('change', handler);
  },
}));
