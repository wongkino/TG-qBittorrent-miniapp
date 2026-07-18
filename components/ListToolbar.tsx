"use client";

import type { SortDir, SortKey } from "@/lib/types";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "added_on", label: "加入時間" },
  { value: "name", label: "名稱" },
  { value: "progress", label: "進度" },
  { value: "dlspeed", label: "下載速度" },
  { value: "upspeed", label: "上傳速度" },
  { value: "size", label: "大小" },
  { value: "eta", label: "ETA" },
];

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
  return (
    <div className="toolbar">
      <div className="toolbar__row">
        <label className="toolbar__label" htmlFor="sort-key">
          排序
        </label>
        <select
          id="sort-key"
          className="select select--inline"
          value={sortKey}
          disabled={busy}
          onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn--sm"
          disabled={busy}
          onClick={onToggleSortDir}
        >
          {sortDir === "desc" ? "↓ 降序" : "↑ 升序"}
        </button>
        <button
          type="button"
          className={`btn btn--sm${selectionMode ? " btn--primary" : ""}`}
          disabled={busy}
          onClick={onToggleSelectionMode}
        >
          {selectionMode ? "完成選取" : "批次"}
        </button>
      </div>

      {selectionMode ? (
        <div className="toolbar__batch">
          <span className="hint">
            已選 {selectedCount}/{totalCount}
          </span>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || totalCount === 0}
            onClick={onSelectAll}
          >
            全選
          </button>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || selectedCount === 0}
            onClick={onClearSelection}
          >
            清除
          </button>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || selectedCount === 0}
            onClick={onBatchPause}
          >
            暫停
          </button>
          <button
            type="button"
            className="btn btn--sm btn--primary"
            disabled={busy || selectedCount === 0}
            onClick={onBatchResume}
          >
            繼續
          </button>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy || selectedCount === 0}
            onClick={() => {
              if (confirm(`移除選取的 ${selectedCount} 個種子（保留檔案）？`)) {
                onBatchDelete(false);
              }
            }}
          >
            移除
          </button>
          <button
            type="button"
            className="btn btn--sm btn--danger"
            disabled={busy || selectedCount === 0}
            onClick={() => {
              if (
                confirm(
                  `刪除選取的 ${selectedCount} 個種子與檔案？此操作無法復原。`
                )
              ) {
                onBatchDelete(true);
              }
            }}
          >
            刪檔
          </button>
        </div>
      ) : null}
    </div>
  );
}
