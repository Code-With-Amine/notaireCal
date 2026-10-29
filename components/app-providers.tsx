"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { monthNames, monthShortNames, translations, type Language } from "@/lib/i18n";

export type Theme = "light" | "dark";

interface AppContextValue {
  language: Language;
  theme: Theme;
  isDark: boolean;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  months: string[];
  shortMonths: string[];
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_LANGUAGE = "daribati.language";
const STORAGE_THEME = "daribati.theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");
  const [theme, setThemeState] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem(STORAGE_LANGUAGE);
      if (storedLanguage === "ar" || storedLanguage === "fr") {
        setLanguageState(storedLanguage);
      }
      const storedTheme = window.localStorage.getItem(STORAGE_THEME);
      if (storedTheme === "dark" || storedTheme === "light") {
        setThemeState(storedTheme);
      }
    } catch {
      // Storage can be unavailable in private mode; keep defaults.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for the stored preferences so we never overwrite them with defaults.
    if (!hydrated) return;

    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";

    try {
      window.localStorage.setItem(STORAGE_THEME, theme);
      window.localStorage.setItem(STORAGE_LANGUAGE, language);
    } catch {
      // Ignore storage errors.
    }
  }, [hydrated, language, theme]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => (current === "fr" ? "ar" : "fr"));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let value = translations[language][key] ?? translations.fr[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([name, replacement]) => {
          value = value.replaceAll(`{${name}}`, String(replacement));
        });
      }
      return value;
    },
    [language],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      language,
      theme,
      isDark: theme === "dark",
      isRTL: language === "ar",
      setLanguage,
      toggleLanguage,
      setTheme,
      toggleTheme,
      t,
      months: monthNames[language],
      shortMonths: monthShortNames[language],
    }),
    [
      language,
      theme,
      setLanguage,
      toggleLanguage,
      setTheme,
      toggleTheme,
      t,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProviders");
  }
  return context;
}
