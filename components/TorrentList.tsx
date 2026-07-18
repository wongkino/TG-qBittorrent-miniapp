"use client";

import type { Torrent } from "@/lib/types";
import { TorrentRow } from "@/components/TorrentRow";

type Props = {
  torrents: Torrent[];
  categories: string[];
  busyHash: string | null;
  onPause: (hash: string) => void;
  onResume: (hash: string) => void;
  onDelete: (hash: string, deleteFiles: boolean) => void;
  onCategoryChange: (hash: string, category: string) => void;
};

export function TorrentList({
  torrents,
  categories,
  busyHash,
  onPause,
  onResume,
  onDelete,
  onCategoryChange,
}: Props) {
  if (torrents.length === 0) {
    return (
      <div className="empty">
        <p>目前沒有種子</p>
        <p className="hint">用下方表單貼上 magnet 或 torrent 連結新增</p>
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
          busy={busyHash === t.hash}
          onPause={onPause}
          onResume={onResume}
          onDelete={onDelete}
          onCategoryChange={onCategoryChange}
        />
      ))}
    </div>
  );
}
