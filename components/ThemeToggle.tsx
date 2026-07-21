"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import {
  applyTheme,
  resolveInitialTheme,
  type AppTheme,
} from "@/lib/theme";

type Props = {
  className?: string;
};

function SunIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
    </svg>
  );
}

export function ThemeToggle({ className }: Props) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<AppTheme>("dark");

  useEffect(() => {
    const next = resolveInitialTheme();
    setTheme(next);
    applyTheme(next);
  }, []);

  function toggle() {
    const next: AppTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  const toLight = theme === "dark";

  return (
    <button
      type="button"
      className={className ?? "btn btn--icon"}
      onClick={toggle}
      aria-label={toLight ? t("theme.switchToLight") : t("theme.switchToDark")}
      title={toLight ? t("theme.toLight") : t("theme.toDark")}
    >
      {toLight ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
