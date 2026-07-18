"use client";

import type { Torrent } from "@/lib/types";
import { TorrentRow } from "@/components/TorrentRow";

type Props = {
  torrents: Torrent[];
  categories: string[];
  busyHash: string | null;
  selected: Set<string>;
  selectionMode: boolean;
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
  onToggleSelect,
  onPause,
  onResume,
  onDelete,
  onCategoryChange,
}: Props) {
  if (torrents.length === 0) {
    return (
      <div className="empty">
        <p>目前沒有種子</p>
        <p className="hint">用下方表單貼上 magnet，或傳 .torrent 給 Bot</p>
      </div>
    );
  }

  return (
    <div className="torrent-list">
      {torrents.map((t) => (
        <TorrentRow
          key={t.hash}
          torrent={t}
          categories={categories}
          busy={busyHash === t.hash || busyHash === "*"}
          selected={selected.has(t.hash)}
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
