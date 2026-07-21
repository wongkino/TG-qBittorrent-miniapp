"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  resolveLocale,
  translate,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";

type I18nValue = {
  locale: Locale;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

type Props = {
  languageCode?: string | null;
  children: ReactNode;
};

export function I18nProvider({ languageCode, children }: Props) {
  const value = useMemo<I18nValue>(() => {
    const locale = resolveLocale(languageCode);
    return {
      locale,
      t: (key, vars) => translate(locale, key, vars),
    };
  }, [languageCode]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    const locale = resolveLocale(null);
    return {
      locale,
      t: (key, vars) => translate(locale, key, vars),
    };
  }
  return ctx;
}
