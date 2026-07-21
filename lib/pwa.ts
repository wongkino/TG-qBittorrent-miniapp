import { isStandaloneWebApp } from "@/lib/google-session";

export const INSTALL_DISMISS_KEY = "tg-dl-install-dismissed";

export function isInstallDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallBanner(): void {
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function shouldOfferInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandaloneWebApp()) return false;
  if (isInstallDismissed()) return false;
  return true;
}

export function isAppleTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isProbablyOfflineError(err: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return true;
  }
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("fetch failed")
  );
}
