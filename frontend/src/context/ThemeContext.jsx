/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Global light/dark theme — mirrors the LanguageContext pattern.
// First visit honours the OS preference (prefers-color-scheme); every later
// visit restores the persisted choice from localStorage (`eration_theme`).
// Applied as `.dark` on <html> so Tailwind `dark:` variants take effect,
// plus `color-scheme` so native controls (inputs, date pickers, scrollbars)
// render in the matching scheme.
const THEME_KEY = 'eration_theme';

const ThemeContext = createContext({ theme: 'light', dark: false, setTheme: () => {}, toggle: () => {} });

function readStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Private mode etc. — fall through to light.
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    const dark = theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Private mode etc. — theme simply doesn't persist.
    }
  }, [theme]);

  const setTheme = useCallback((next) => setThemeState(next === 'dark' ? 'dark' : 'light'), []);
  const toggle = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return (
    <ThemeContext.Provider value={{ theme, dark: theme === 'dark', setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
