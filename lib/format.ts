import {
  resolveLocale,
  stateMessageKey,
  translate,
  type Locale,
} from "@/lib/i18n";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** i;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function formatSpeed(bytesPerSec: number): string {
  if (!bytesPerSec) return "0 B/s";
  return `${formatBytes(bytesPerSec)}/s`;
}

export function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0 || seconds >= 8640000) {
    return "∞";
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatProgress(progress: number): string {
  return `${Math.min(100, Math.max(0, progress * 100)).toFixed(1)}%`;
}

const PAUSED_STATES = new Set([
  "pausedDL",
  "pausedUP",
  "stoppedDL",
  "stoppedUP",
]);

export function isPausedState(state: string): boolean {
  return PAUSED_STATES.has(state);
}

export function stateLabel(
  state: string,
  locale: Locale = resolveLocale(null)
): string {
  const key = stateMessageKey(state);
  if (key) return translate(locale, key);
  return state;
}
