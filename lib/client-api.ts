export type Torrent = {
  hash: string;
  name: string;
  size: number;
  progress: number;
  dlspeed: number;
  upspeed: number;
  state: string;
  num_seeds: number;
  num_leechs: number;
  eta: number;
  ratio: number;
};

function authHeader(initData: string): HeadersInit {
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

export async function fetchMe(initData: string) {
  const res = await fetch("/api/auth/me", {
    headers: authHeader(initData),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{
    ok: boolean;
    user: { id: number; first_name?: string; username?: string };
  }>;
}

export async function fetchTorrents(initData: string) {
  const res = await fetch("/api/qb/torrents", {
    headers: authHeader(initData),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json() as Promise<{ torrents: Torrent[] }>;
}

export async function pauseTorrent(initData: string, hash: string) {
  const res = await fetch("/api/qb/pause", {
    method: "POST",
    headers: authHeader(initData),
    body: JSON.stringify({ hashes: hash }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function resumeTorrent(initData: string, hash: string) {
  const res = await fetch("/api/qb/resume", {
    method: "POST",
    headers: authHeader(initData),
    body: JSON.stringify({ hashes: hash }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function deleteTorrent(
  initData: string,
  hash: string,
  deleteFiles: boolean
) {
  const res = await fetch("/api/qb/delete", {
    method: "POST",
    headers: authHeader(initData),
    body: JSON.stringify({ hashes: hash, deleteFiles }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function addTorrentUrl(initData: string, urls: string) {
  const res = await fetch("/api/qb/add", {
    method: "POST",
    headers: authHeader(initData),
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}
