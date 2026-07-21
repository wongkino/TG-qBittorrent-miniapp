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
import type { ClientAuth } from "@/lib/client-auth";
import { AuthSessionError } from "@/lib/client-auth";
import { useI18n } from "@/components/I18nProvider";
import {
  AddIcon,
  JoinIcon,
  RefreshIcon,
  RemoveIcon,
} from "@/components/icons";

type Props = {
  auth: ClientAuth;
  categories: string[];
  onAdded?: () => void;
  onAuthExpired?: () => void;
};

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function isAuthExpired(err: unknown): boolean {
  return err instanceof AuthSessionError;
}

export function RssPanel({ auth, categories, onAdded, onAuthExpired }: Props) {
  const { t } = useI18n();
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
      const { feeds: next } = await fetchRssFeeds(auth);
      setFeeds(next);
      setSelectedPath((prev) => {
        if (prev && next.some((f) => f.path === prev)) return prev;
        return next[0]?.path ?? null;
      });
    } catch (err) {
      if (isAuthExpired(err)) {
        onAuthExpired?.();
        return;
      }
      setError(errMessage(err, t("rss.loadFailed")));
    } finally {
      setLoading(false);
    }
  }, [auth, onAuthExpired, t]);

  useEffect(() => {
    let cancelled = false;

    fetchRssFeeds(auth)
      .then(({ feeds: next }) => {
        if (cancelled) return;
        setFeeds(next);
        setSelectedPath((prev) => {
          if (prev && next.some((f) => f.path === prev)) return prev;
          return next[0]?.path ?? null;
        });
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          if (isAuthExpired(err)) {
            onAuthExpired?.();
            return;
          }
          setError(errMessage(err, t("rss.loadFailed")));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [auth, onAuthExpired, t]);

  async function withBusy(action: () => Promise<void>, okMessage?: string) {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await action();
      if (okMessage) setStatus(okMessage);
      await reload();
    } catch (err) {
      if (isAuthExpired(err)) {
        onAuthExpired?.();
        return;
      }
      setError(errMessage(err, t("app.actionFailed")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rss">
      <p className="hint rss__intro">{t("rss.intro")}</p>

      <form
        className="rss__add"
        onSubmit={(e) => {
          e.preventDefault();
          const feedUrl = url.trim();
          if (!feedUrl) return;
          void withBusy(async () => {
            await addRssFeed(auth, feedUrl, name.trim() || undefined);
            setUrl("");
            setName("");
          }, t("rss.added"));
        }}
      >
        <input
          className="input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("rss.urlPlaceholder")}
          inputMode="url"
          autoCapitalize="off"
          disabled={busy}
        />
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("rss.namePlaceholder")}
          disabled={busy}
        />
        <button
          type="submit"
          className="btn btn--icon btn--primary"
          disabled={busy || !url.trim()}
          aria-label={t("rss.add")}
          title={t("rss.add")}
        >
          <AddIcon />
        </button>
      </form>

      <div className="rss__toolbar">
        <label className="rss__cat">
          <span className="hint">{t("rss.categoryOnAdd")}</span>
          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={busy}
          >
            <option value="">{t("rss.noCategory")}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--icon btn--sm"
          disabled={busy || loading}
          aria-label={t("rss.reloadList")}
          title={t("rss.reloadList")}
          onClick={() => void reload()}
        >
          <RefreshIcon />
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {status ? <p className="rss__status">{status}</p> : null}

      {loading ? (
        <p className="hint">{t("rss.loading")}</p>
      ) : feeds.length === 0 ? (
        <div className="empty">
          <p>{t("rss.empty")}</p>
          <p className="hint">{t("rss.emptyHint")}</p>
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
                <span className="rss__feed-title">
                  {feed.title || feed.path}
                </span>
                <span className="hint">
                  {feed.articles.filter((a) => !a.isRead).length}/
                  {feed.articles.length}
                  {feed.hasError ? t("rss.errorTag") : ""}
                  {feed.isLoading ? t("rss.loadingTag") : ""}
                </span>
              </button>
            ))}
          </div>

          <div className="rss__detail">
            {selected ? (
              <>
                <div className="rss__detail-head">
                  <div>
                    <h2 className="rss__detail-title">
                      {selected.title || selected.path}
                    </h2>
                    <p className="hint rss__detail-url">
                      {selected.url || selected.path}
                    </p>
                  </div>
                  <div className="rss__detail-actions">
                    <button
                      type="button"
                      className="btn btn--icon btn--sm"
                      disabled={busy}
                      aria-label={t("rss.refresh")}
                      title={t("rss.refresh")}
                      onClick={() =>
                        void withBusy(
                          () => refreshRssFeed(auth, selected.path),
                          t("rss.refreshed")
                        )
                      }
                    >
                      <RefreshIcon />
                    </button>
                    <button
                      type="button"
                      className="btn btn--icon btn--sm btn--danger"
                      disabled={busy}
                      aria-label={t("rss.remove")}
                      title={t("rss.remove")}
                      onClick={() => {
                        if (
                          !window.confirm(
                            t("rss.confirmRemove", {
                              name: selected.title || selected.path,
                            })
                          )
                        ) {
                          return;
                        }
                        void withBusy(async () => {
                          await removeRssFeed(auth, selected.path);
                        }, t("rss.removed"));
                      }}
                    >
                      <RemoveIcon />
                    </button>
                  </div>
                </div>

                {selected.articles.length === 0 ? (
                  <p className="hint">{t("rss.noArticles")}</p>
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
                            className="btn btn--icon btn--sm btn--primary"
                            disabled={busy || !article.torrentUrl}
                            aria-label={t("rss.join")}
                            title={t("rss.join")}
                            onClick={() =>
                              void withBusy(async () => {
                                await addTorrentUrl(
                                  auth,
                                  article.torrentUrl,
                                  category.trim() || undefined
                                );
                                if (article.id) {
                                  await markRssRead(
                                    auth,
                                    selected.path,
                                    article.id
                                  ).catch(() => undefined);
                                }
                                onAdded?.();
                              }, t("rss.addedDownload"))
                            }
                          >
                            <JoinIcon />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="hint">{t("rss.pickFeed")}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
