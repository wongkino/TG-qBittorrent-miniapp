"use client";

import { useState } from "react";
import type { Torrent } from "@/lib/types";
import { CategorySelect } from "@/components/CategorySelect";
import { useI18n } from "@/components/I18nProvider";
import {
  ChevronRightIcon,
  DeleteFilesIcon,
  PauseIcon,
  RemoveIcon,
  ResumeIcon,
} from "@/components/icons";
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
  const [open, setOpen] = useState(false);
  const paused = isPausedState(torrent.state);
  const pct = Math.min(100, Math.max(0, torrent.progress * 100));
  const categoryOptions =
    torrent.category && !categories.includes(torrent.category)
      ? [...categories, torrent.category].sort((a, b) =>
          a.localeCompare(b, locale)
        )
      : categories;

  return (
    <article
      className={`list-row${selected ? " list-row--selected" : ""}${open ? " list-row--open" : ""}`}
    >
      <div className="list-row__main">
        {selectionMode ? (
          <label className="list-row__check">
            <input
              type="checkbox"
              checked={selected}
              disabled={busy}
              onChange={() => onToggleSelect(torrent.hash)}
            />
          </label>
        ) : null}

        <button
          type="button"
          className="list-row__body"
          disabled={selectionMode}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          <span className="list-row__title" title={torrent.name}>
            {torrent.name}
          </span>
          <span className="list-row__subtitle">
            {stateLabel(torrent.state, locale)}
            {" · "}
            {formatProgress(torrent.progress)}
            {" · "}
            {formatBytes(torrent.size)}
          </span>
          <span className="list-row__meta">
            <span>↓ {formatSpeed(torrent.dlspeed)}</span>
            <span>↑ {formatSpeed(torrent.upspeed)}</span>
            <span>ETA {formatEta(torrent.eta)}</span>
          </span>
          <span
            className="progress progress--thin"
            aria-label={t("torrent.progress", {
              progress: formatProgress(torrent.progress),
            })}
          >
            <span className="progress__bar" style={{ width: `${pct}%` }} />
          </span>
        </button>

        <div className="list-row__trailing">
          {!selectionMode ? (
            paused ? (
              <button
                type="button"
                className="btn btn--icon btn--sm btn--primary"
                disabled={busy}
                aria-label={t("torrent.resume")}
                title={t("torrent.resume")}
                onClick={() => onResume(torrent.hash)}
              >
                <ResumeIcon size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--icon btn--sm"
                disabled={busy}
                aria-label={t("torrent.pause")}
                title={t("torrent.pause")}
                onClick={() => onPause(torrent.hash)}
              >
                <PauseIcon size={16} />
              </button>
            )
          ) : null}
          <span
            className={`list-row__chevron${open ? " list-row__chevron--open" : ""}`}
            aria-hidden
          >
            <ChevronRightIcon size={16} />
          </span>
        </div>
      </div>

      {open && !selectionMode ? (
        <div className="list-row__detail">
          <div className="list-row__category">
            <label
              className="list-row__category-label"
              htmlFor={`cat-${torrent.hash}`}
            >
              {t("torrent.category")}
            </label>
            <CategorySelect
              id={`cat-${torrent.hash}`}
              value={torrent.category}
              categories={categoryOptions}
              disabled={busy}
              emptyLabel={t("add.noCategory")}
              onChange={(category) => onCategoryChange(torrent.hash, category)}
            />
          </div>
          <div className="list-row__actions">
            <button
              type="button"
              className="btn btn--sm"
              disabled={busy}
              onClick={() => {
                if (confirm(t("torrent.confirmRemove"))) {
                  onDelete(torrent.hash, false);
                }
              }}
            >
              <RemoveIcon size={16} />
              <span>{t("torrent.remove")}</span>
            </button>
            <button
              type="button"
              className="btn btn--sm btn--danger"
              disabled={busy}
              onClick={() => {
                if (confirm(t("torrent.confirmDelete"))) {
                  onDelete(torrent.hash, true);
                }
              }}
            >
              <DeleteFilesIcon size={16} />
              <span>{t("torrent.deleteFiles")}</span>
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
