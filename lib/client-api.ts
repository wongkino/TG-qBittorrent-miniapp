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

function joinHashes(hashes: string | string[]): string {
  return Array.isArray(hashes) ? hashes.join("|") : hashes;
}

export function fetchTorrents(initData: string) {
  return api<{ torrents: Torrent[] }>("/api/qb/torrents", initData);
}

export function fetchCategories(initData: string) {
  return api<{ categories: string[] }>("/api/qb/categories", initData);
}

export function pauseTorrent(initData: string, hashes: string | string[]) {
  return api<void>("/api/qb/pause", initData, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes) }),
  });
}

export function resumeTorrent(initData: string, hashes: string | string[]) {
  return api<void>("/api/qb/resume", initData, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes) }),
  });
}

export function deleteTorrent(
  initData: string,
  hashes: string | string[],
  deleteFiles: boolean
) {
  return api<void>("/api/qb/delete", initData, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes), deleteFiles }),
  });
}

export function setTorrentCategory(
  initData: string,
  hashes: string | string[],
  category: string
) {
  return api<void>("/api/qb/category", initData, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes), category }),
  });
}

export function addTorrentUrl(
  initData: string,
  urls: string,
  category?: string
) {
  return api<void>("/api/qb/add", initData, {
    method: "POST",
    body: JSON.stringify({ urls, category }),
  });
}
