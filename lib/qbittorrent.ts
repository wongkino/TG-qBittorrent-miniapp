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
  cookie: string | null;
  basicAuth: string;
  expiresAt: number;
};

let cachedSession: Session | null = null;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function getConfig() {
  const baseUrl = readEnv("QBITTORRENT_URL")?.replace(/\/+$/, "");
  const username = readEnv("QBITTORRENT_USERNAME");
  const password = readEnv("QBITTORRENT_PASSWORD");

  if (!baseUrl || !username || !password) {
    throw new QBitError("qBittorrent is not configured", 500);
  }

  return { baseUrl, username, password };
}

function basicAuthHeader(username: string, password: string): string {
  const raw = `${username}:${password}`;
  const bytes = new TextEncoder().encode(raw);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `Basic ${btoa(binary)}`;
}

/** Origin without default :443/:80 — qBittorrent CSRF compares these strictly. */
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
  if (session.cookie) {
    headers.set("Cookie", session.cookie);
  }
  if (!headers.has("User-Agent")) {
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "text/plain, */*");
  }
  return headers;
}

function collectSetCookieHeaders(res: Response): string[] {
  const headers = res.headers as Headers & {
    getSetCookie?: () => string[];
    getAll?: (name: string) => string[];
  };

  if (typeof headers.getSetCookie === "function") {
    const list = headers.getSetCookie();
    if (list.length > 0) return list;
  }

  if (typeof headers.getAll === "function") {
    try {
      const list = headers.getAll("Set-Cookie");
      if (list.length > 0) return list;
    } catch {
      // ignore
    }
  }

  const single = headers.get("set-cookie");
  if (single) return [single];

  return [];
}

function extractSidCookie(setCookieHeaders: string[]): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(/(?:^|[,\s])SID=([^;,\s]+)/i);
    if (match?.[1]) {
      const value = match[1].replace(/^"|"$/g, "");
      if (value) return `SID=${value}`;
    }
  }
  return null;
}

async function ensureSession(force = false): Promise<Session> {
  if (!force && cachedSession && cachedSession.expiresAt > Date.now()) {
    return cachedSession;
  }

  const { baseUrl, username, password } = getConfig();
  const basicAuth = basicAuthHeader(username, password);

  const body = new URLSearchParams({ username, password });
  const origin = requestOrigin(baseUrl);

  // Form login without Basic Auth first — some proxies short-circuit to 204
  // when Authorization is present and never return qBittorrent's SID cookie.
  const loginHeaders = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
    Referer: `${origin}/`,
    Origin: origin,
    Accept: "text/plain, */*",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v2/auth/login`, {
      method: "POST",
      headers: loginHeaders,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (err) {
    cachedSession = null;
    const detail = err instanceof Error ? err.message : "network error";
    throw new QBitError(`Failed to reach qBittorrent (${detail})`, 502);
  }

  const text = (await res.text()).trim();
  const cookie = extractSidCookie(collectSetCookieHeaders(res));
  const bodyOk = text === "Ok." || text === "Ok";

  // Success shapes:
  // - Classic qBittorrent: 200 + "Ok." (+ SID cookie)
  // - Proxy/auth_request: 204 with no body/cookie — API may still work via Basic Auth
  // - SID cookie present on any 2xx
  const loginOk = res.ok && (bodyOk || res.status === 204 || Boolean(cookie));

  if (!loginOk) {
    cachedSession = null;
    const snippet = text ? `: ${text.slice(0, 80)}` : "";
    throw new QBitError(
      `Failed to login to qBittorrent (${res.status})${snippet}`,
      502
    );
  }

  cachedSession = {
    cookie,
    basicAuth,
    expiresAt: Date.now() + 55 * 60 * 1000,
  };

  // Verify the session can actually list torrents.
  const probe = await fetch(`${baseUrl}/api/v2/torrents/info`, {
    method: "GET",
    headers: qbHeaders(baseUrl, cachedSession),
    cache: "no-store",
  });

  if (!probe.ok) {
    // Retry probe with Basic Auth only (no cookie) in case SID was required
    // but missing, and reverse proxy accepts Basic Auth instead.
    const basicOnly: Session = {
      cookie: null,
      basicAuth,
      expiresAt: cachedSession.expiresAt,
    };
    const probeBasic = await fetch(`${baseUrl}/api/v2/torrents/info`, {
      method: "GET",
      headers: qbHeaders(baseUrl, basicOnly),
      cache: "no-store",
    });

    if (probeBasic.ok) {
      cachedSession = basicOnly;
      return cachedSession;
    }

    const probeText = (await probe.text().catch(() => "")).trim();
    cachedSession = null;
    throw new QBitError(
      `qBittorrent auth probe failed (${probe.status})${
        probeText
          ? `: ${probeText.slice(0, 80)}`
          : cookie
            ? ""
            : " (no SID cookie; Basic Auth also failed)"
      }`,
      502
    );
  }

  return cachedSession;
}

async function qbFetch(
  path: string,
  init: RequestInit = {},
  retried = false
): Promise<Response> {
  const { baseUrl } = getConfig();
  const session = await ensureSession(false);

  const headers = qbHeaders(baseUrl, session, init.headers);

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if ((res.status === 401 || res.status === 403) && !retried) {
    cachedSession = null;
    await ensureSession(true);
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
