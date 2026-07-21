import { authHeaders, AuthSessionError, type ClientAuth } from "@/lib/client-auth";
import type { Torrent } from "@/lib/types";

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
  auth: ClientAuth,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { ...authHeaders(auth), ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new AuthSessionError(await parseError(res));
    }
    throw new Error(await parseError(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function joinHashes(hashes: string | string[]): string {
  return Array.isArray(hashes) ? hashes.join("|") : hashes;
}

export function fetchTorrents(auth: ClientAuth) {
  return api<{ torrents: Torrent[] }>("/api/qb/torrents", auth);
}

/** Torrents + categories in one HTTP request (boot / full refresh). */
export function fetchSnapshot(auth: ClientAuth) {
  return api<{ torrents: Torrent[]; categories: string[] }>(
    "/api/qb/snapshot",
    auth
  );
}

export function pauseTorrent(auth: ClientAuth, hashes: string | string[]) {
  return api<void>("/api/qb/pause", auth, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes) }),
  });
}

export function resumeTorrent(auth: ClientAuth, hashes: string | string[]) {
  return api<void>("/api/qb/resume", auth, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes) }),
  });
}

export function deleteTorrent(
  auth: ClientAuth,
  hashes: string | string[],
  deleteFiles: boolean
) {
  return api<void>("/api/qb/delete", auth, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes), deleteFiles }),
  });
}

export function setTorrentCategory(
  auth: ClientAuth,
  hashes: string | string[],
  category: string
) {
  return api<void>("/api/qb/category", auth, {
    method: "POST",
    body: JSON.stringify({ hashes: joinHashes(hashes), category }),
  });
}

export function addTorrentUrl(
  auth: ClientAuth,
  urls: string,
  category?: string
) {
  return api<void>("/api/qb/add", auth, {
    method: "POST",
    body: JSON.stringify({ urls, category }),
  });
}

export type ClientRssArticle = {
  id: string;
  title: string;
  torrentUrl: string;
  link: string;
  date: string;
  isRead: boolean;
};

export type ClientRssFeed = {
  path: string;
  url: string;
  title: string;
  isLoading: boolean;
  hasError: boolean;
  articles: ClientRssArticle[];
};

export function fetchRssFeeds(auth: ClientAuth) {
  return api<{ feeds: ClientRssFeed[] }>("/api/qb/rss", auth);
}

export function addRssFeed(auth: ClientAuth, url: string, path?: string) {
  return api<void>("/api/qb/rss/add", auth, {
    method: "POST",
    body: JSON.stringify({ url, path }),
  });
}

export function removeRssFeed(auth: ClientAuth, path: string) {
  return api<void>("/api/qb/rss/remove", auth, {
    method: "POST",
    body: JSON.stringify({ path }),
  });
}

export function refreshRssFeed(auth: ClientAuth, path: string) {
  return api<void>("/api/qb/rss/refresh", auth, {
    method: "POST",
    body: JSON.stringify({ path }),
  });
}

export function markRssRead(
  auth: ClientAuth,
  path: string,
  articleId?: string
) {
  return api<void>("/api/qb/rss/read", auth, {
    method: "POST",
    body: JSON.stringify({ path, articleId }),
  });
}
