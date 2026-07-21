"use client";

import type { Torrent } from "@/lib/types";
import { CategorySelect } from "@/components/CategorySelect";
import { useI18n } from "@/components/I18nProvider";
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
  categories: string[];
  busy: boolean;
  selected: boolean;
  selectionMode: boolean;
  onToggleSelect: (hash: string) => void;
  onPause: (hash: string) => void;
  onResume: (hash: string) => void;
  onDelete: (hash: string, deleteFiles: boolean) => void;
  onCategoryChange: (hash: string, category: string) => void;
};

export function TorrentRow({
  torrent,
  categories,
  busy,
  selected,
  selectionMode,
  onToggleSelect,
  onPause,
  onResume,
  onDelete,
  onCategoryChange,
}: Props) {
  const { t, locale } = useI18n();
  const paused = isPausedState(torrent.state);
  const pct = Math.min(100, Math.max(0, torrent.progress * 100));
  const categoryOptions =
    torrent.category && !categories.includes(torrent.category)
      ? [...categories, torrent.category].sort((a, b) =>
          a.localeCompare(b, locale)
        )
      : categories;

  return (
    <article className={`torrent-row${selected ? " torrent-row--selected" : ""}`}>
      <div className="torrent-row__header">
        {selectionMode ? (
          <label className="torrent-row__check">
            <input
              type="checkbox"
              checked={selected}
              disabled={busy}
              onChange={() => onToggleSelect(torrent.hash)}
            />
          </label>
        ) : null}
        <h2 className="torrent-row__name" title={torrent.name}>
          {torrent.name}
        </h2>
        <span className="torrent-row__state">
          {stateLabel(torrent.state, locale)}
        </span>
      </div>

      <div
        className="progress"
        aria-label={t("torrent.progress", {
          progress: formatProgress(torrent.progress),
        })}
      >
        <div className="progress__bar" style={{ width: `${pct}%` }} />
      </div>

      <div className="torrent-row__meta">
        <span>{formatProgress(torrent.progress)}</span>
        <span>{formatBytes(torrent.size)}</span>
        <span>↓ {formatSpeed(torrent.dlspeed)}</span>
        <span>↑ {formatSpeed(torrent.upspeed)}</span>
        <span>ETA {formatEta(torrent.eta)}</span>
      </div>

      <div className="torrent-row__category">
        <label
          className="torrent-row__category-label"
          htmlFor={`cat-${torrent.hash}`}
        >
          {t("torrent.category")}
        </label>
        <CategorySelect
          id={`cat-${torrent.hash}`}
          value={torrent.category}
          categories={categoryOptions}
          disabled={busy || selectionMode}
          emptyLabel={t("add.noCategory")}
          onChange={(category) => onCategoryChange(torrent.hash, category)}
        />
      </div>

      {!selectionMode ? (
        <div className="torrent-row__actions">
          {paused ? (
            <button
              type="button"
              className="btn btn--primary"
              disabled={busy}
              onClick={() => onResume(torrent.hash)}
            >
              {t("torrent.resume")}
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => onPause(torrent.hash)}
            >
              {t("torrent.pause")}
            </button>
          )}
          <button
            type="button"
            className="btn"
            disabled={busy}
            onClick={() => {
              if (confirm(t("torrent.confirmRemove"))) {
                onDelete(torrent.hash, false);
              }
            }}
          >
            {t("torrent.remove")}
          </button>
          <button
            type="button"
            className="btn btn--danger"
            disabled={busy}
            onClick={() => {
              if (confirm(t("torrent.confirmDelete"))) {
                onDelete(torrent.hash, true);
              }
            }}
          >
            {t("torrent.deleteFiles")}
          </button>
        </div>
      ) : null}
    </article>
  );
}
