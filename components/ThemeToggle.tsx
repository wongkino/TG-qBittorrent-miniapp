"use client";

import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { MoonIcon, SunIcon } from "@/components/icons";
import {
  applyTheme,
  resolveInitialTheme,
  type AppTheme,
} from "@/lib/theme";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<AppTheme>(() =>
    typeof window === "undefined" ? "dark" : resolveInitialTheme()
  );

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
