"use client";

import { useSyncExternalStore } from "react";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";

/** No-op: theme is applied once from the SSR/hydration script. */
function subscribe() {
  return () => {};
}

/**
 * Injects the theme boot IIFE only during SSR + hydration.
 * Post-hydration client renders return null to avoid React 19's
 * "Encountered a script tag while rendering" console error.
 */
export function ThemeBootScript() {
  const shouldRender = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );

  if (!shouldRender) return null;

  return (
    <script
      id="theme-boot"
      dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
    />
  );
}
