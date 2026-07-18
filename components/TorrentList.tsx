"use client";

import type { Torrent } from "@/lib/client-api";
import { TorrentRow } from "@/components/TorrentRow";

type Props = {
  torrents: Torrent[];
  busyHash: string | null;
  onPause: (hash: string) => void;
  onResume: (hash: string) => void;
  onDelete: (hash: string, deleteFiles: boolean) => void;
};

export function TorrentList({
  torrents,
  busyHash,
  onPause,
  onResume,
  onDelete,
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
          busy={busyHash === t.hash}
          onPause={onPause}
          onResume={onResume}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
