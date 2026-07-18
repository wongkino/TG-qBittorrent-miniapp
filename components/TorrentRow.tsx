"use client";

import type { Torrent } from "@/lib/client-api";
import {
  formatBytes,
  formatEta,
  formatProgress,
  formatSpeed,
  isPausedState,
  stateLabel,
} from "@/lib/format";

type Props = {
  torrent: Torrent;
  busy: boolean;
  onPause: (hash: string) => void;
  onResume: (hash: string) => void;
  onDelete: (hash: string, deleteFiles: boolean) => void;
};

export function TorrentRow({
  torrent,
  busy,
  onPause,
  onResume,
  onDelete,
}: Props) {
  const paused = isPausedState(torrent.state);
  const pct = Math.min(100, Math.max(0, torrent.progress * 100));

  return (
    <article className="torrent-row">
      <div className="torrent-row__header">
        <h2 className="torrent-row__name" title={torrent.name}>
          {torrent.name}
        </h2>
        <span className="torrent-row__state">{stateLabel(torrent.state)}</span>
      </div>

      <div className="progress" aria-label={`進度 ${formatProgress(torrent.progress)}`}>
        <div className="progress__bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="torrent-row__meta">
        <span>{formatProgress(torrent.progress)}</span>
        <span>{formatBytes(torrent.size)}</span>
        <span>↓ {formatSpeed(torrent.dlspeed)}</span>
        <span>↑ {formatSpeed(torrent.upspeed)}</span>
        <span>ETA {formatEta(torrent.eta)}</span>
      </div>

      <div className="torrent-row__actions">
        {paused ? (
          <button
            type="button"
            className="btn btn--primary"
            disabled={busy}
            onClick={() => onResume(torrent.hash)}
          >
            繼續
          </button>
        ) : (
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => onPause(torrent.hash)}
          >
            暫停
          </button>
        )}
        <button
          type="button"
          className="btn"
          disabled={busy}
          onClick={() => {
            if (confirm("只從列表移除，保留已下載檔案？")) {
              onDelete(torrent.hash, false);
            }
          }}
        >
          移除
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={busy}
          onClick={() => {
            if (confirm("刪除種子並刪除檔案？此操作無法復原。")) {
              onDelete(torrent.hash, true);
            }
          }}
        >
          刪檔
        </button>
      </div>
    </article>
  );
}
