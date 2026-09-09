/* eslint-disable react-refresh/only-export-components */
// Phase 3.1 + 3.2 — tiny dictionary + language state.
// `t(key, vars)` reads the active language, falls back to English, then to
// the key itself so a missing Hindi entry never renders blank. `{name}`
// placeholders are interpolated from `vars`. Language persists in
// localStorage (`eration_lang`) and mirrors to `<html lang>` per GIGW Q13.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { en } from './en';
import { hi } from './hi';

const LANG_KEY = 'eration_lang';
const dicts = { en, hi };

function readStoredLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'hi' || v === 'en') return v;
  } catch {
    // Private mode — fall through to default.
  }
  return 'en';
}

function interpolate(template, vars) {
  if (!vars || typeof template !== 'string') return template;
  return template.replace(/\{(\w+)\}/g, (m, name) =>
    vars[name] !== undefined ? String(vars[name]) : m
  );
}

const LanguageContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang === 'hi' ? 'hi' : 'en');
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // Non-persistent session — language still applies for this visit.
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next === 'hi' ? 'hi' : 'en');
  }, []);

  const t = useCallback(
    (key, vars) => {
      const table = dicts[lang] || en;
      const raw = table[key] ?? en[key] ?? key;
      return interpolate(raw, vars);
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
