import type { Torrent } from "@/lib/types";

export type { Torrent };

type Session = {
  cookie: string | null;
  basicAuth: string;
  expiresAt: number;
};

const SESSION_TTL_MS = 55 * 60 * 1000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

let cachedSession: Session | null = null;
let loginInflight: Promise<Session> | null = null;

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function getConfig() {
  const baseUrl = env("QBITTORRENT_URL")?.replace(/\/+$/, "");
  const username = env("QBITTORRENT_USERNAME");
  const password = env("QBITTORRENT_PASSWORD");
  if (!baseUrl || !username || !password) {
    throw new QBitError("qBittorrent is not configured", 500);
  }
  return { baseUrl, username, password };
}

function basicAuthHeader(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`;
}

/** Strip default ports — qBittorrent CSRF compares Origin strictly. */
function requestOrigin(baseUrl: string): string {
  const url = new URL(baseUrl);
  if (
    (url.protocol === "https:" && url.port === "443") ||
    (url.protocol === "http:" && url.port === "80")
  ) {
    url.port = "";
  }
  return url.origin;
}

function qbHeaders(
  baseUrl: string,
  session: Pick<Session, "cookie" | "basicAuth">,
  extra?: HeadersInit
): Headers {
  const origin = requestOrigin(baseUrl);
  const headers = new Headers(extra);
  headers.set("Referer", `${origin}/`);
  headers.set("Origin", origin);
  headers.set("Authorization", session.basicAuth);
  headers.set("User-Agent", USER_AGENT);
  headers.set("Accept", "text/plain, */*");
  if (session.cookie) headers.set("Cookie", session.cookie);
  return headers;
}

function extractSidCookie(res: Response): string | null {
  const headers = res.headers as Headers & {
    getSetCookie?: () => string[];
    getAll?: (name: string) => string[];
  };

  let list = headers.getSetCookie?.() ?? [];
  if (!list.length && typeof headers.getAll === "function") {
    try {
      list = headers.getAll("Set-Cookie");
    } catch {
      list = [];
    }
  }
  if (!list.length) {
    const single = headers.get("set-cookie");
    if (single) list = [single];
  }

  for (const header of list) {
    const match = header.match(/(?:^|[,\s])SID=([^;,\s]+)/i);
    const value = match?.[1]?.replace(/^"|"$/g, "");
    if (value) return `SID=${value}`;
  }
  return null;
}

async function login(): Promise<Session> {
  const { baseUrl, username, password } = getConfig();
  const basicAuth = basicAuthHeader(username, password);
  const origin = requestOrigin(baseUrl);

  // Form login without Basic Auth — some proxies return empty 204 when
  // Authorization is already present and never emit a SID cookie.
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v2/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: `${origin}/`,
        Origin: origin,
        Accept: "text/plain, */*",
        "User-Agent": USER_AGENT,
      },
      body: new URLSearchParams({ username, password }),
      cache: "no-store",
      redirect: "manual",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "network error";
    throw new QBitError(`Failed to reach qBittorrent (${detail})`, 502);
  }

  const text = (await res.text()).trim();
  const cookie = extractSidCookie(res);
  const bodyOk = text === "Ok." || text === "Ok";
  const loginOk = res.ok && (bodyOk || res.status === 204 || Boolean(cookie));

  if (!loginOk) {
    const snippet = text ? `: ${text.slice(0, 80)}` : "";
    throw new QBitError(
      `Failed to login to qBittorrent (${res.status})${snippet}`,
      502
    );
  }

  return {
    cookie,
    basicAuth,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

async function ensureSession(force = false): Promise<Session> {
  if (force) cachedSession = null;
  if (!force && cachedSession && cachedSession.expiresAt > Date.now()) {
    return cachedSession;
  }
  if (loginInflight) return loginInflight;

  loginInflight = login()
    .then((session) => {
      cachedSession = session;
      return session;
    })
    .catch((err) => {
      cachedSession = null;
      throw err;
    })
    .finally(() => {
      loginInflight = null;
    });

  return loginInflight;
}

async function qbFetch(
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<Response> {
  const { baseUrl } = getConfig();
  const session = await ensureSession(false);
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: qbHeaders(baseUrl, session, init.headers),
    cache: "no-store",
  });

  if ((res.status === 401 || res.status === 403) && !retried) {
    await ensureSession(true);
    return qbFetch(path, init, true);
  }

  return res;
}

async function postForm(
  path: string,
  fields: Record<string, string>
): Promise<void> {
  const res = await qbFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
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
  primary: string,
  fallback: string,
  fields: Record<string, string>
): Promise<void> {
  try {
    await postForm(primary, fields);
  } catch (err) {
    try {
      await postForm(fallback, fields);
    } catch {
      throw err;
    }
  }
}

type RawTorrent = Record<string, unknown>;

function projectTorrent(raw: RawTorrent): Torrent {
  return {
    hash: String(raw.hash ?? ""),
    name: String(raw.name ?? ""),
    size: Number(raw.size) || 0,
    progress: Number(raw.progress) || 0,
    dlspeed: Number(raw.dlspeed) || 0,
    upspeed: Number(raw.upspeed) || 0,
    state: String(raw.state ?? "unknown"),
    eta: Number(raw.eta) || 0,
  };
}

export async function listTorrents(): Promise<Torrent[]> {
  const res = await qbFetch("/api/v2/torrents/info", { method: "GET" });
  if (!res.ok) throw new QBitError("Failed to fetch torrents", 502);
  const raw = (await res.json()) as RawTorrent[];
  return raw.map(projectTorrent);
}

export async function pauseTorrents(hashes: string): Promise<void> {
  await postWithFallback("/api/v2/torrents/stop", "/api/v2/torrents/pause", {
    hashes,
  });
}

export async function resumeTorrents(hashes: string): Promise<void> {
  await postWithFallback("/api/v2/torrents/start", "/api/v2/torrents/resume", {
    hashes,
  });
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
