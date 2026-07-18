"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addTorrentUrl, fetchBrowseHtml } from "@/lib/client-api";

type Shortcut = { id: string; label: string; url: string };

type Props = {
  initData: string;
  categories: string[];
  onAdded?: () => void;
};

const STORAGE_KEY = "tg-dl-browse-shortcuts";

const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: "example",
    label: "範例（可刪）",
    url: "https://example.com",
  },
];

function loadShortcuts(): Shortcut[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHORTCUTS;
    const parsed = JSON.parse(raw) as Shortcut[];
    if (!Array.isArray(parsed)) return DEFAULT_SHORTCUTS;
    return parsed.filter((s) => s?.id && s?.label && s?.url);
  } catch {
    return DEFAULT_SHORTCUTS;
  }
}

function saveShortcuts(list: Shortcut[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function BrowserPanel({ initData, categories, onAdded }: Props) {
  const [urlInput, setUrlInput] = useState("https://");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() =>
    typeof window === "undefined" ? DEFAULT_SHORTCUTS : loadShortcuts()
  );
  const [adding, setAdding] = useState(false);

  const persist = useCallback((next: Shortcut[]) => {
    setShortcuts(next);
    saveShortcuts(next);
  }, []);

  const openUrl = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      setLoading(true);
      setError(null);
      setStatus(null);
      try {
        const page = await fetchBrowseHtml(initData, trimmed);
        setHtml(page);
        setCurrentUrl(trimmed);
        setUrlInput(trimmed);
      } catch (err) {
        setHtml(null);
        setError(errMessage(err, "無法載入頁面"));
      } finally {
        setLoading(false);
      }
    },
    [initData]
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as {
        source?: string;
        type?: string;
        url?: string;
      };
      if (!data || data.source !== "tg-dl-browse" || !data.url) return;

      if (data.type === "navigate") {
        void openUrl(data.url);
        return;
      }
      if (data.type === "add") {
        void (async () => {
          setAdding(true);
          setStatus(null);
          setError(null);
          try {
            await addTorrentUrl(
              initData,
              data.url!,
              category.trim() || undefined
            );
            setStatus("已加入 qBittorrent");
            onAdded?.();
          } catch (err) {
            setError(errMessage(err, "加入失敗"));
          } finally {
            setAdding(false);
          }
        })();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [initData, category, openUrl, onAdded]);

  const canSaveShortcut = useMemo(() => {
    if (!currentUrl) return false;
    return !shortcuts.some((s) => s.url === currentUrl);
  }, [currentUrl, shortcuts]);

  function addShortcut() {
    if (!currentUrl) return;
    const label =
      window.prompt("捷徑名稱", new URL(currentUrl).hostname) ||
      new URL(currentUrl).hostname;
    persist([
      ...shortcuts.filter((s) => s.url !== currentUrl),
      { id: `${Date.now()}`, label: label.trim() || currentUrl, url: currentUrl },
    ]);
  }

  function removeShortcut(id: string) {
    persist(shortcuts.filter((s) => s.id !== id));
  }

  return (
    <section className="browse">
      <p className="hint browse__intro">
        經代理開啟網頁並攔截 magnet／.torrent 連結，直接加入 qBittorrent。部分網站可能無法完整顯示。
      </p>

      <form
        className="browse__bar"
        onSubmit={(e) => {
          e.preventDefault();
          void openUrl(urlInput);
        }}
      >
        <input
          className="input browse__url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button type="submit" className="btn" disabled={loading || adding}>
          {loading ? "載入中…" : "前往"}
        </button>
      </form>

      <div className="browse__meta">
        <label className="browse__cat">
          <span className="hint">加入時分類</span>
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">無分類</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {currentUrl ? (
          <button
            type="button"
            className="btn btn--sm btn--ghost"
            disabled={!canSaveShortcut}
            onClick={addShortcut}
          >
            存成捷徑
          </button>
        ) : null}
      </div>

      {shortcuts.length > 0 ? (
        <div className="browse__shortcuts">
          {shortcuts.map((s) => (
            <div key={s.id} className="browse__shortcut">
              <button
                type="button"
                className="btn btn--sm"
                disabled={loading || adding}
                onClick={() => void openUrl(s.url)}
              >
                {s.label}
              </button>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                aria-label={`刪除捷徑 ${s.label}`}
                onClick={() => removeShortcut(s.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="hint">尚無捷徑。開啟頁面後可「存成捷徑」。</p>
      )}

      {error ? <p className="error">{error}</p> : null}
      {status ? <p className="browse__status">{status}</p> : null}
      {adding ? <p className="hint">正在加入…</p> : null}

      <div className="browse__frame-wrap">
        {html ? (
          <iframe
            className="browse__frame"
            title="內嵌瀏覽"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            srcDoc={html}
          />
        ) : (
          <div className="browse__placeholder">
            <p className="hint">輸入網址或點捷徑開始瀏覽</p>
          </div>
        )}
      </div>
    </section>
  );
}
