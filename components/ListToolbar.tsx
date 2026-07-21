"use client";

import type { SortDir, SortKey } from "@/lib/types";
import { useI18n } from "@/components/I18nProvider";
import {
  BatchDoneIcon,
  BatchOpenIcon,
  ClearIcon,
  DeleteFilesIcon,
  PauseIcon,
  RemoveIcon,
  ResumeIcon,
  SelectAllIcon,
  SortAscIcon,
  SortDescIcon,
} from "@/components/icons";
import {
  STATUS_FILTERS,
  type StatusFilter,
} from "@/lib/format";
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

function filterLabelKey(filter: StatusFilter): MessageKey {
  return `filter.${filter}` as MessageKey;
}

type Props = {
  sortKey: SortKey;
  sortDir: SortDir;
  statusFilter: StatusFilter;
  selectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  busy: boolean;
  onSortKeyChange: (key: SortKey) => void;
  onToggleSortDir: () => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
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
  statusFilter,
  selectionMode,
  selectedCount,
  totalCount,
  busy,
  onSortKeyChange,
  onToggleSortDir,
  onStatusFilterChange,
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
        <label className="toolbar__label" htmlFor="status-filter">
          {t("filter.label")}
        </label>
        <select
          id="status-filter"
          className="select select--inline"
          value={statusFilter}
          disabled={busy}
          onChange={(e) =>
            onStatusFilterChange(e.target.value as StatusFilter)
          }
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter} value={filter}>
              {t(filterLabelKey(filter))}
            </option>
          ))}
        </select>
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
          {sortDir === "desc" ? <SortDescIcon /> : <SortAscIcon />}
        </button>
        <button
          type="button"
          className={`btn btn--icon${selectionMode ? " btn--primary" : ""}`}
          disabled={busy}
          onClick={onToggleSelectionMode}
          aria-label={selectionMode ? t("batch.done") : t("batch.open")}
          title={selectionMode ? t("batch.done") : t("batch.open")}
        >
          {selectionMode ? <BatchDoneIcon /> : <BatchOpenIcon />}
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
            className="btn btn--icon btn--sm"
            disabled={busy || totalCount === 0}
            aria-label={t("batch.selectAll")}
            title={t("batch.selectAll")}
            onClick={onSelectAll}
          >
            <SelectAllIcon />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--sm"
            disabled={busy || selectedCount === 0}
            aria-label={t("batch.clear")}
            title={t("batch.clear")}
            onClick={onClearSelection}
          >
            <ClearIcon />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--sm"
            disabled={busy || selectedCount === 0}
            aria-label={t("batch.pause")}
            title={t("batch.pause")}
            onClick={onBatchPause}
          >
            <PauseIcon />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--sm btn--primary"
            disabled={busy || selectedCount === 0}
            aria-label={t("batch.resume")}
            title={t("batch.resume")}
            onClick={onBatchResume}
          >
            <ResumeIcon />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--sm"
            disabled={busy || selectedCount === 0}
            aria-label={t("batch.remove")}
            title={t("batch.remove")}
            onClick={() => {
              if (
                confirm(t("batch.confirmRemove", { count: selectedCount }))
              ) {
                onBatchDelete(false);
              }
            }}
          >
            <RemoveIcon />
          </button>
          <button
            type="button"
            className="btn btn--icon btn--sm btn--danger"
            disabled={busy || selectedCount === 0}
            aria-label={t("batch.deleteFiles")}
            title={t("batch.deleteFiles")}
            onClick={() => {
              if (
                confirm(t("batch.confirmDelete", { count: selectedCount }))
              ) {
                onBatchDelete(true);
              }
            }}
          >
            <DeleteFilesIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
