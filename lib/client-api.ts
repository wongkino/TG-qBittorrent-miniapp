import type { Torrent } from "@/lib/types";

export type { Torrent };

function headers(initData: string): HeadersInit {
  return {
    Authorization: `tma ${initData}`,
    "Content-Type": "application/json",
  };
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

async function api<T>(
  path: string,
  initData: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...headers(initData), ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchTorrents(initData: string) {
  return api<{ torrents: Torrent[] }>("/api/qb/torrents", initData);
}

export function pauseTorrent(initData: string, hash: string) {
  return api<void>("/api/qb/pause", initData, {
    method: "POST",
    body: JSON.stringify({ hashes: hash }),
  });
}

export function resumeTorrent(initData: string, hash: string) {
  return api<void>("/api/qb/resume", initData, {
    method: "POST",
    body: JSON.stringify({ hashes: hash }),
  });
}

export function deleteTorrent(
  initData: string,
  hash: string,
  deleteFiles: boolean
) {
  return api<void>("/api/qb/delete", initData, {
    method: "POST",
    body: JSON.stringify({ hashes: hash, deleteFiles }),
  });
}

export function addTorrentUrl(initData: string, urls: string) {
  return api<void>("/api/qb/add", initData, {
    method: "POST",
    body: JSON.stringify({ urls }),
  });
}
