import { env } from "@/lib/env";
import { mergeCookieHeader } from "@/lib/browse-cookies";

export { mergeCookieHeader };

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

export type BrowseResult = {
  html: string;
  finalUrl: string;
  setCookies: string[];
};

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
  if (a === 100 && b >= 64 && b <= 127) return true;
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

function readSetCookies(res: Response): string[] {
  const headers = res.headers as Headers & {
    getSetCookie?: () => string[];
  };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
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

  function patchOpen() {
    try {
      Object.defineProperty(window, "open", {
        configurable: true,
        writable: true,
        value: function (url) {
          handleUrl(url);
          return null;
        }
      });
    } catch (e) {
      try { window.open = function (url) { handleUrl(url); return null; }; } catch (e2) {}
    }
  }
  patchOpen();
  setInterval(patchOpen, 1000);

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

  // Age-gate (e.g. javdb "請注意"): auto-confirm so cookies can be stored by parent.
  try {
    var age = document.querySelector(".over18-modal.is-active a.button.is-success[href]");
    if (age) {
      var ageHref = age.getAttribute("href") || age.href;
      if (ageHref) {
        setTimeout(function () { handleUrl(ageHref); }, 50);
      }
    }
  } catch (e) {}

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;

    // ClipboardJS "複製" magnet buttons
    var copyBtn = t.closest(".copy-to-clipboard, [data-clipboard-text]");
    if (copyBtn) {
      var clip = copyBtn.getAttribute("data-clipboard-text") || "";
      if (clip.indexOf("magnet:") === 0 || /\\.torrent(\\?|#|$)/i.test(clip)) {
        e.preventDefault();
        e.stopPropagation();
        send("add", clip);
        return;
      }
    }

    var a = t.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || a.href;
    if (!href || href.charAt(0) === "#") return;
    if (href.indexOf("javascript:") === 0) return;
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

export async function fetchBrowsableHtml(
  target: URL,
  cookieHeader?: string
): Promise<BrowseResult> {
  let cookie = cookieHeader?.trim() || "";
  let current = target.toString();
  const allSetCookies: string[] = [];
  let res: Response | null = null;

  for (let hop = 0; hop < 8; hop++) {
    assertBrowsableUrl(current);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
      };
      if (cookie) headers.Cookie = cookie;

      res = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new BrowseError("連線逾時", 504);
      }
      throw new BrowseError("無法連線目標網站", 502);
    } finally {
      clearTimeout(timer);
    }

    const setCookies = readSetCookies(res);
    if (setCookies.length) {
      allSetCookies.push(...setCookies);
      cookie = mergeCookieHeader(cookie, setCookies);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        throw new BrowseError("重新導向缺少 Location", 502);
      }
      current = new URL(location, current).toString();
      continue;
    }

    break;
  }

  if (!res) {
    throw new BrowseError("無法連線目標網站", 502);
  }

  assertBrowsableUrl(current);

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
  return {
    html: injectBrowseBridge(html, current),
    finalUrl: current,
    setCookies: allSetCookies,
  };
}
