export type QBittorrentTorrent = {
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
  category: string;
  tags: string;
  added_on: number;
  completion_on: number;
  ratio: number;
};

type Session = {
  cookie: string;
  expiresAt: number;
};

let cachedSession: Session | null = null;

function getConfig() {
  const baseUrl = process.env.QBITTORRENT_URL?.replace(/\/+$/, "");
  const username = process.env.QBITTORRENT_USERNAME;
  const password = process.env.QBITTORRENT_PASSWORD;

  if (!baseUrl || !username || !password) {
    throw new QBitError("qBittorrent is not configured", 500);
  }

  return { baseUrl, username, password };
}

function extractSidCookie(setCookieHeaders: string[]): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(/(?:^|,\s*)SID=([^;]+)/i);
    if (match) {
      return `SID=${match[1]}`;
    }
  }
  // Some runtimes join cookies; also try simple SID=
  for (const header of setCookieHeaders) {
    if (header.includes("SID=")) {
      const part = header.split(";").find((p) => p.trim().startsWith("SID="));
      if (part) return part.trim();
    }
  }
  return null;
}

async function login(force = false): Promise<string> {
  if (!force && cachedSession && cachedSession.expiresAt > Date.now()) {
    return cachedSession.cookie;
  }

  const { baseUrl, username, password } = getConfig();
  const body = new URLSearchParams({ username, password });

  const res = await fetch(`${baseUrl}/api/v2/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  if (!res.ok || text.trim() !== "Ok.") {
    cachedSession = null;
    throw new QBitError("Failed to login to qBittorrent", 502);
  }

  const getSetCookie = (
    res.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.();
  const setCookieRaw = res.headers.get("set-cookie");
  const cookies = getSetCookie?.length
    ? getSetCookie
    : setCookieRaw
      ? [setCookieRaw]
      : [];

  const cookie = extractSidCookie(cookies);
  if (!cookie) {
    cachedSession = null;
    throw new QBitError("qBittorrent login did not return SID cookie", 502);
  }

  // Cache for ~55 minutes (SID typically lasts longer; refresh early)
  cachedSession = {
    cookie,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  return cookie;
}

async function qbFetch(
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<Response> {
  const { baseUrl } = getConfig();
  const cookie = await login(false);

  const headers = new Headers(init.headers);
  headers.set("Cookie", cookie);

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (res.status === 403 && !retried) {
    cachedSession = null;
    await login(true);
    return qbFetch(path, init, true);
  }

  return res;
}

async function postForm(
  path: string,
  fields: Record<string, string>
): Promise<void> {
  const body = new URLSearchParams(fields);
  const res = await qbFetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new QBitError(
      `qBittorrent request failed (${res.status})${text ? `: ${text.slice(0, 120)}` : ""}`,
      502
    );
  }
}

/** Prefer v5 stop/start; fall back to v4 pause/resume. */
async function postWithFallback(
  primaryPath: string,
  fallbackPath: string,
  fields: Record<string, string>
): Promise<void> {
  try {
    await postForm(primaryPath, fields);
  } catch (err) {
    try {
      await postForm(fallbackPath, fields);
    } catch {
      throw err;
    }
  }
}

export async function listTorrents(): Promise<QBittorrentTorrent[]> {
  const res = await qbFetch("/api/v2/torrents/info", { method: "GET" });
  if (!res.ok) {
    throw new QBitError("Failed to fetch torrents", 502);
  }
  return (await res.json()) as QBittorrentTorrent[];
}

export async function pauseTorrents(hashes: string): Promise<void> {
  await postWithFallback(
    "/api/v2/torrents/stop",
    "/api/v2/torrents/pause",
    { hashes }
  );
}

export async function resumeTorrents(hashes: string): Promise<void> {
  await postWithFallback(
    "/api/v2/torrents/start",
    "/api/v2/torrents/resume",
    { hashes }
  );
}

export async function deleteTorrents(
  hashes: string,
  deleteFiles: boolean
): Promise<void> {
  await postForm("/api/v2/torrents/delete", {
    hashes,
    deleteFiles: deleteFiles ? "true" : "false",
  });
}

export async function addTorrent(urls: string): Promise<void> {
  await postForm("/api/v2/torrents/add", { urls });
}

export class QBitError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "QBitError";
    this.status = status;
  }
}
