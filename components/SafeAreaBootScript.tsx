"use client";

import { useSyncExternalStore } from "react";
import { SAFE_AREA_BOOT_SCRIPT } from "@/lib/safe-area";

/** No-op: safe-area vars are applied once from the SSR/hydration script. */
function subscribe() {
  return () => {};
}

/**
 * Injects the safe-area boot IIFE only during SSR + hydration.
 * Post-hydration client renders return null to avoid React 19's
 * "Encountered a script tag while rendering" console error.
 */
export function SafeAreaBootScript() {
  const shouldRender = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );

  if (!shouldRender) return null;

  return (
    <script
      id="safe-area-boot"
      dangerouslySetInnerHTML={{ __html: SAFE_AREA_BOOT_SCRIPT }}
    />
  );
}
