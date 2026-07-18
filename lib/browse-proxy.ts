import { env } from "@/lib/env";

const MAX_BYTES = 1_500_000;
const FETCH_TIMEOUT_MS = 15_000;

export class BrowseError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "BrowseError";
    this.status = status;
  }
}

function isPrivateIPv4(host: string): boolean {
  const parts = host.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function hostAllowed(hostname: string): boolean {
  const allow = (env("BROWSE_ALLOWED_HOSTS") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return true;
  const host = hostname.toLowerCase();
  return allow.some(
    (rule) => host === rule || (rule.startsWith("*.") && host.endsWith(rule.slice(1)))
  );
}

/** Reject non-http(s) and obvious private / metadata targets. */
export function assertBrowsableUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BrowseError("網址無效", 400);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new BrowseError("只允許 http/https", 400);
  }
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0"
  ) {
    throw new BrowseError("不允許的主機", 400);
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) && isPrivateIPv4(host)) {
    throw new BrowseError("不允許的位址", 400);
  }
  if (host.includes(":")) {
    const h = host.replace(/^\[|\]$/g, "");
    if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) {
      throw new BrowseError("不允許的位址", 400);
    }
  }
  if (!hostAllowed(host)) {
    throw new BrowseError("此網域不在允許清單（BROWSE_ALLOWED_HOSTS）", 403);
  }
  return url;
}

function injectBrowseBridge(html: string, pageUrl: string): string {
  const baseHref = pageUrl;
  const bridge = `
<base href="${baseHref.replaceAll('"', "&quot;")}">
<meta name="tg-dl-browse" content="1">
<script>
(function () {
  function send(type, url) {
    try {
      parent.postMessage({ source: "tg-dl-browse", type: type, url: url }, "*");
    } catch (e) {}
  }

  function resolveUrl(url) {
    if (!url) return "";
    try {
      return new URL(String(url), document.baseURI || location.href).href;
    } catch (e) {
      return String(url);
    }
  }

  function handleUrl(raw) {
    var href = resolveUrl(raw);
    if (!href) return true;
    if (href.indexOf("magnet:") === 0) {
      send("add", href);
      return true;
    }
    if (/^https?:/i.test(href) && /\\.torrent(\\?|#|$)/i.test(href)) {
      send("add", href);
      return true;
    }
    if (/^https?:/i.test(href)) {
      send("navigate", href);
      return true;
    }
    return false;
  }

  // Many "popup" buttons use window.open instead of <a href>.
  try {
    window.open = function (url) {
      handleUrl(url);
      return null;
    };
  } catch (e) {}

  // Some sites assign location to open downloads / magnets.
  try {
    var _assign = Location.prototype.assign;
    Location.prototype.assign = function (url) {
      if (handleUrl(url)) return;
      return _assign.call(this, url);
    };
    var _replace = Location.prototype.replace;
    Location.prototype.replace = function (url) {
      if (handleUrl(url)) return;
      return _replace.call(this, url);
    };
  } catch (e) {}

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || a.href;
    if (!href || href.charAt(0) === "#") return;
    if (handleUrl(href)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Catch delayed popup patterns (e.g. setTimeout + open).
  document.addEventListener("auxclick", function (e) {
    if (e.button !== 1) return;
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || a.href;
    if (handleUrl(href)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
})();
</script>
`.trim();

  let out = html
    .replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, "")
    .replace(/<base\b[^>]*>/gi, "");

  if (/<head[\s>]/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1>${bridge}`);
  } else {
    out = `${bridge}${out}`;
  }
  return out;
}

export async function fetchBrowsableHtml(target: URL): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(target.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; tg-dl-browse/1.0; +https://github.com/wongkino/TG-qBittorrent-miniapp)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new BrowseError("連線逾時", 504);
    }
    throw new BrowseError("無法連線目標網站", 502);
  } finally {
    clearTimeout(timer);
  }

  // Re-validate after redirects
  assertBrowsableUrl(res.url);

  if (!res.ok) {
    throw new BrowseError(`目標網站回傳 ${res.status}`, 502);
  }

  const contentType = res.headers.get("content-type") || "";
  if (
    contentType &&
    !/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)
  ) {
    throw new BrowseError("目標不是 HTML 頁面", 415);
  }

  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) {
    throw new BrowseError("頁面過大", 413);
  }

  const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  return injectBrowseBridge(html, res.url);
}
