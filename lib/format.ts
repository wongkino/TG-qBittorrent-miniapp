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

export function stateLabel(state: string): string {
  const map: Record<string, string> = {
    downloading: "下載中",
    uploading: "做種中",
    pausedDL: "已暫停",
    pausedUP: "已暫停",
    stoppedDL: "已停止",
    stoppedUP: "已停止",
    queuedDL: "排隊中",
    queuedUP: "排隊做種",
    stalledDL: "停滯",
    stalledUP: "停滯做種",
    checkingDL: "檢查中",
    checkingUP: "檢查中",
    checkingResumeData: "檢查中",
    forcedDL: "強制下載",
    forcedUP: "強制做種",
    metaDL: "取得中繼資料",
    moving: "移動中",
    missingFiles: "缺少檔案",
    error: "錯誤",
    unknown: "未知",
  };
  return map[state] ?? state;
}
