"use client";

import { useState, type ReactNode } from "react";
import type { SortDir, SortKey } from "@/lib/types";
import { Sheet } from "@/components/Sheet";
import { useI18n } from "@/components/I18nProvider";
import {
  BatchDoneIcon,
  BatchOpenIcon,
  ClearIcon,
  DeleteFilesIcon,
  EllipsisIcon,
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
  const [optionsOpen, setOptionsOpen] = useState(false);

  function IconAction({
    label,
    onClick,
    disabled,
    danger,
    primary,
    children,
  }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
    primary?: boolean;
    children: ReactNode;
  }) {
    return (
      <button
        type="button"
        className={`btn btn--icon btn--sm${primary ? " btn--primary" : ""}${danger ? " btn--danger" : ""}`}
        disabled={disabled}
        aria-label={label}
        title={label}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <>
      <div className="toolbar toolbar--quiet">
        <div className="filter-chips" role="tablist" aria-label={t("filter.label")}>
          {STATUS_FILTERS.map((filter) => {
            const active = statusFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={active}
                className={`filter-chip${active ? " filter-chip--active" : ""}`}
                disabled={busy}
                onClick={() => onStatusFilterChange(filter)}
              >
                {t(filterLabelKey(filter))}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="btn btn--icon btn--sm"
          disabled={busy}
          aria-label={t("list.options")}
          title={t("list.options")}
          onClick={() => setOptionsOpen(true)}
        >
          <EllipsisIcon size={16} />
        </button>
      </div>

      {selectionMode ? (
        <div className="toolbar toolbar--batch">
          <span className="hint">
            {t("batch.selected", {
              selected: selectedCount,
              total: totalCount,
            })}
          </span>
          <div className="toolbar__batch">
            <IconAction
              label={t("batch.selectAll")}
              disabled={busy || totalCount === 0}
              onClick={onSelectAll}
            >
              <SelectAllIcon />
            </IconAction>
            <IconAction
              label={t("batch.clear")}
              disabled={busy || selectedCount === 0}
              onClick={onClearSelection}
            >
              <ClearIcon />
            </IconAction>
            <IconAction
              label={t("batch.pause")}
              disabled={busy || selectedCount === 0}
              onClick={onBatchPause}
            >
              <PauseIcon />
            </IconAction>
            <IconAction
              label={t("batch.resume")}
              disabled={busy || selectedCount === 0}
              primary
              onClick={onBatchResume}
            >
              <ResumeIcon />
            </IconAction>
            <IconAction
              label={t("batch.remove")}
              disabled={busy || selectedCount === 0}
              onClick={() => {
                if (
                  confirm(t("batch.confirmRemove", { count: selectedCount }))
                ) {
                  onBatchDelete(false);
                }
              }}
            >
              <RemoveIcon />
            </IconAction>
            <IconAction
              label={t("batch.deleteFiles")}
              disabled={busy || selectedCount === 0}
              danger
              onClick={() => {
                if (
                  confirm(t("batch.confirmDelete", { count: selectedCount }))
                ) {
                  onBatchDelete(true);
                }
              }}
            >
              <DeleteFilesIcon />
            </IconAction>
            <IconAction
              label={t("batch.done")}
              disabled={busy}
              primary
              onClick={onToggleSelectionMode}
            >
              <BatchDoneIcon />
            </IconAction>
          </div>
        </div>
      ) : null}

      {optionsOpen ? (
        <Sheet title={t("list.options")} onClose={() => setOptionsOpen(false)}>
          <div className="settings-group">
            <p className="settings-group__header">{t("list.sortSection")}</p>
            <div className="settings-group__card">
              <label className="settings-row" htmlFor="sort-key-sheet">
                <span>{t("sort.label")}</span>
                <select
                  id="sort-key-sheet"
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
              </label>
              <button
                type="button"
                className="settings-row settings-row--button"
                disabled={busy}
                onClick={onToggleSortDir}
              >
                <span>
                  {sortDir === "desc" ? t("sort.desc") : t("sort.asc")}
                </span>
                {sortDir === "desc" ? <SortDescIcon /> : <SortAscIcon />}
              </button>
            </div>

            <p className="settings-group__header">{t("list.batchSection")}</p>
            <div className="settings-group__card">
              <button
                type="button"
                className="settings-row settings-row--button"
                disabled={busy}
                onClick={() => {
                  onToggleSelectionMode();
                  setOptionsOpen(false);
                }}
              >
                <span>
                  {selectionMode ? t("batch.done") : t("batch.open")}
                </span>
                {selectionMode ? <BatchDoneIcon /> : <BatchOpenIcon />}
              </button>
            </div>
          </div>
        </Sheet>
      ) : null}
    </>
  );
}
