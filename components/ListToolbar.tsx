"use client";

import type { SortDir, SortKey } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";
import type { MessageKey } from "@/lib/i18n";

const SORT_KEYS: SortKey[] = [
  "added_on",
  "name",
  "progress",
  "dlspeed",
  "upspeed",
  "size",
  "eta",
];

function sortLabelKey(key: SortKey): MessageKey {
  return `sort.${key}` as MessageKey;
}

type Props = {
  sortKey: SortKey;
  sortDir: SortDir;
  selectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  busy: boolean;
  onSortKeyChange: (key: SortKey) => void;
  onToggleSortDir: () => void;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchPause: () => void;
  onBatchResume: () => void;
  onBatchDelete: (deleteFiles: boolean) => void;
};

export function ListToolbar({
  sortKey,
  sortDir,
  selectionMode,
  selectedCount,
  totalCount,
  busy,
  onSortKeyChange,
  onToggleSortDir,
  onToggleSelectionMode,
  onSelectAll,
  onClearSelection,
  onBatchPause,
  onBatchResume,
  onBatchDelete,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="toolbar">
      <div className="toolbar__row">
        <label className="toolbar__label" htmlFor="sort-key">
          {t("sort.label")}
        </label>
        <select
          id="sort-key"
          className="select select--inline"
          value={sortKey}
          disabled={busy}
          onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        >
          {SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(sortLabelKey(key))}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn--icon"
          disabled={busy}
          onClick={onToggleSortDir}
          aria-label={sortDir === "desc" ? t("sort.desc") : t("sort.asc")}
          title={sortDir === "desc" ? t("sort.desc") : t("sort.asc")}
        >
          {sortDir === "desc" ? (
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
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          ) : (
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
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className={`btn btn--icon${selectionMode ? " btn--primary" : ""}`}
          disabled={busy}
          onClick={onToggleSelectionMode}
          aria-label={selectionMode ? t("batch.done") : t("batch.open")}
          title={selectionMode ? t("batch.done") : t("batch.open")}
        >
          {selectionMode ? (
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
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
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
              <path d="m3 17 2 2 4-4" />
              <path d="m3 7 2 2 4-4" />
              <path d="M13 6h8" />
              <path d="M13 12h8" />
              <path d="M13 18h8" />
            </svg>
          )}
        </button>
      </div>

      {selectionMode ? (
        <div className="toolbar__batch">
          <span className="hint">
            {t("batch.selected", {
              selected: selectedCount,
              total: totalCount,
            })}
          </span>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || totalCount === 0}
            onClick={onSelectAll}
          >
            {t("batch.selectAll")}
          </button>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || selectedCount === 0}
            onClick={onClearSelection}
          >
            {t("batch.clear")}
          </button>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || selectedCount === 0}
            onClick={onBatchPause}
          >
            {t("batch.pause")}
          </button>
          <button
            type="button"
            className="btn btn--sm btn--primary"
            disabled={busy || selectedCount === 0}
            onClick={onBatchResume}
          >
            {t("batch.resume")}
          </button>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || selectedCount === 0}
            onClick={() => {
              if (
                confirm(
                  t("batch.confirmRemove", { count: selectedCount })
                )
              ) {
                onBatchDelete(false);
              }
            }}
          >
            {t("batch.remove")}
          </button>
          <button
            type="button"
            className="btn btn--sm btn--danger"
            disabled={busy || selectedCount === 0}
            onClick={() => {
              if (
                confirm(
                  t("batch.confirmDelete", { count: selectedCount })
                )
              ) {
                onBatchDelete(true);
              }
            }}
          >
            {t("batch.deleteFiles")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
