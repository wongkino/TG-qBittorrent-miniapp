"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addRssFeed,
  addTorrentUrl,
  fetchRssFeeds,
  markRssRead,
  refreshRssFeed,
  removeRssFeed,
  type ClientRssFeed,
} from "@/lib/client-api";

type Props = {
  initData: string;
  categories: string[];
  onAdded?: () => void;
};

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function RssPanel({ initData, categories, onAdded }: Props) {
  const [feeds, setFeeds] = useState<ClientRssFeed[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const selected = useMemo(
    () => feeds.find((f) => f.path === selectedPath) ?? null,
    [feeds, selectedPath]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { feeds: next } = await fetchRssFeeds(initData);
      setFeeds(next);
      setSelectedPath((prev) => {
        if (prev && next.some((f) => f.path === prev)) return prev;
        return next[0]?.path ?? null;
      });
    } catch (err) {
      setError(errMessage(err, "無法載入 RSS"));
    } finally {
      setLoading(false);
    }
  }, [initData]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function withBusy(action: () => Promise<void>, okMessage?: string) {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await action();
      if (okMessage) setStatus(okMessage);
      await reload();
    } catch (err) {
      setError(errMessage(err, "操作失敗"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rss">
      <p className="hint rss__intro">
        管理 qBittorrent RSS 訂閱；可重新整理來源，並從文章直接加入下載。
      </p>

      <form
        className="rss__add"
        onSubmit={(e) => {
          e.preventDefault();
          const feedUrl = url.trim();
          if (!feedUrl) return;
          void withBusy(async () => {
            await addRssFeed(initData, feedUrl, name.trim() || undefined);
            setUrl("");
            setName("");
          }, "已新增訂閱");
        }}
      >
        <input
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="RSS 網址 https://"
          inputMode="url"
          autoCapitalize="off"
          disabled={busy}
        />
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名稱（可選）"
          disabled={busy}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !url.trim()}>
          新增
        </button>
      </form>

      <div className="rss__toolbar">
        <label className="rss__cat">
          <span className="hint">加入時分類</span>
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={busy}
          >
            <option value="">無分類</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--sm"
          disabled={busy || loading}
          onClick={() => void reload()}
        >
          重整列表
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {status ? <p className="rss__status">{status}</p> : null}

      {loading ? (
        <p className="hint">載入 RSS…</p>
      ) : feeds.length === 0 ? (
        <div className="empty">
          <p>尚未訂閱任何 RSS</p>
          <p className="hint">貼上 feed 網址後按新增</p>
        </div>
      ) : (
        <div className="rss__layout">
          <div className="rss__feeds">
            {feeds.map((feed) => (
              <button
                key={feed.path}
                type="button"
                className={`rss__feed${selectedPath === feed.path ? " rss__feed--active" : ""}`}
                onClick={() => setSelectedPath(feed.path)}
                disabled={busy}
              >
                <span className="rss__feed-title">{feed.title || feed.path}</span>
                <span className="hint">
                  {feed.articles.filter((a) => !a.isRead).length}/{feed.articles.length}
                  {feed.hasError ? " · 錯誤" : ""}
                  {feed.isLoading ? " · 載入中" : ""}
                </span>
              </button>
            ))}
          </div>

          <div className="rss__detail">
            {selected ? (
              <>
                <div className="rss__detail-head">
                  <div>
                    <h2 className="rss__detail-title">{selected.title || selected.path}</h2>
                    <p className="hint rss__detail-url">{selected.url || selected.path}</p>
                  </div>
                  <div className="rss__detail-actions">
                    <button
                      type="button"
                      className="btn btn--sm"
                      disabled={busy}
                      onClick={() =>
                        void withBusy(
                          () => refreshRssFeed(initData, selected.path),
                          "已重新整理"
                        )
                      }
                    >
                      重新整理
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      disabled={busy}
                      onClick={() => {
                        if (!window.confirm(`移除訂閱「${selected.title || selected.path}」？`)) {
                          return;
                        }
                        void withBusy(async () => {
                          await removeRssFeed(initData, selected.path);
                        }, "已移除");
                      }}
                    >
                      移除
                    </button>
                  </div>
                </div>

                {selected.articles.length === 0 ? (
                  <p className="hint">尚無文章（可按重新整理）</p>
                ) : (
                  <ul className="rss__articles">
                    {selected.articles.map((article) => (
                      <li
                        key={`${selected.path}:${article.id}:${article.title}`}
                        className={`rss__article${article.isRead ? " rss__article--read" : ""}`}
                      >
                        <div className="rss__article-main">
                          <p className="rss__article-title">{article.title}</p>
                          {article.date ? (
                            <p className="hint">{article.date}</p>
                          ) : null}
                        </div>
                        <div className="rss__article-actions">
                          <button
                            type="button"
                            className="btn btn--sm btn--primary"
                            disabled={busy || !article.torrentUrl}
                            onClick={() =>
                              void withBusy(async () => {
                                await addTorrentUrl(
                                  initData,
                                  article.torrentUrl,
                                  category.trim() || undefined
                                );
                                if (article.id) {
                                  await markRssRead(
                                    initData,
                                    selected.path,
                                    article.id
                                  ).catch(() => undefined);
                                }
                                onAdded?.();
                              }, "已加入下載")
                            }
                          >
                            加入
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="hint">選擇左側訂閱</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
