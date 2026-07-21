"use client";

import type { Torrent } from "@/lib/types";
import { TorrentRow } from "@/components/TorrentRow";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  torrents: Torrent[];
  categories: string[];
  busyHash: string | null;
  selected: Set<string>;
  selectionMode: boolean;
  filterActive: boolean;
  onToggleSelect: (hash: string) => void;
  onPause: (hash: string) => void;
  onResume: (hash: string) => void;
  onDelete: (hash: string, deleteFiles: boolean) => void;
  onCategoryChange: (hash: string, category: string) => void;
};

export function TorrentList({
  torrents,
  categories,
  busyHash,
  selected,
  selectionMode,
  filterActive,
  onToggleSelect,
  onPause,
  onResume,
  onDelete,
  onCategoryChange,
}: Props) {
  const { t } = useI18n();

  if (torrents.length === 0) {
    return (
      <div className="empty">
        <p>{filterActive ? t("list.emptyFiltered") : t("list.empty")}</p>
        {filterActive ? null : (
          <p className="hint">{t("list.emptyHint")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="torrent-list">
      {torrents.map((torrent) => (
        <TorrentRow
          key={torrent.hash}
          torrent={torrent}
          categories={categories}
          busy={busyHash === torrent.hash || busyHash === "*"}
          selected={selected.has(torrent.hash)}
          selectionMode={selectionMode}
          onToggleSelect={onToggleSelect}
          onPause={onPause}
          onResume={onResume}
          onDelete={onDelete}
          onCategoryChange={onCategoryChange}
        />
      ))}
    </div>
  );
}
