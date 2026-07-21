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
import {
  DEFAULT_LOCALE,
  persistLocale,
  resolveInitialLocale,
  translate,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

type Props = {
  children: ReactNode;
};

export function I18nProvider({ children }: Props) {
  // Always start with DEFAULT_LOCALE so SSR and hydration match; sync
  // from localStorage after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = resolveInitialLocale();
    setLocaleState(initial);
    persistLocale(initial);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale]
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => undefined,
      t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
    };
  }
  return ctx;
}
