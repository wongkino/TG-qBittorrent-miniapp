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
import { CategorySelect } from "@/components/CategorySelect";
import { EmptyState } from "@/components/EmptyState";
import { useI18n } from "@/components/I18nProvider";
import { LoadingState } from "@/components/LoadingState";
import {
  AddIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  InboxIcon,
  RefreshIcon,
  RemoveIcon,
} from "@/components/icons";
import {
  classifyClientError,
  errMessage,
} from "@/lib/client-errors";

type Props = {
  auth: ClientAuth;
  categories: string[];
  onAdded?: () => void;
  onAuthExpired?: () => void;
};

export function RssPanel({ auth, categories, onAdded, onAuthExpired }: Props) {
  const { t } = useI18n();
  const [feeds, setFeeds] = useState<ClientRssFeed[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [pushed, setPushed] = useState(false);
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

  const handleError = useCallback(
    (err: unknown) => {
      if (classifyClientError(err) === "auth") {
        onAuthExpired?.();
        return;
      }
      setError(errMessage(err, t("app.actionFailed")));
    },
    [onAuthExpired, t]
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
      if (classifyClientError(err) === "auth") {
        onAuthExpired?.();
        return;
      }
      setError(errMessage(err, t("rss.loadFailed")));
    } finally {
      setLoading(false);
    }
  }, [auth, onAuthExpired, t]);

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
      handleError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`rss${pushed ? " rss--pushed" : ""}`}>
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
          <CategorySelect
            value={category}
            categories={categories}
            disabled={busy}
            emptyLabel={t("rss.noCategory")}
            onChange={setCategory}
          />
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
        <LoadingState label={t("rss.loading")} />
      ) : feeds.length === 0 ? (
        <EmptyState
          icon={<InboxIcon size={28} />}
          title={t("rss.empty")}
          hint={t("rss.emptyHint")}
        />
      ) : (
        <div className="rss__layout">
          <div className="rss__feeds">
            <p className="settings-group__header">{t("rss.feedsSection")}</p>
            <div className="inset-group">
              {feeds.map((feed) => (
                <button
                  key={feed.path}
                  type="button"
                  className={`list-row list-row--button${selectedPath === feed.path ? " list-row--selected" : ""}`}
                  onClick={() => {
                    setSelectedPath(feed.path);
                    setPushed(true);
                  }}
                  disabled={busy}
                >
                  <span className="list-row__body">
                    <span className="list-row__title">
                      {feed.title || feed.path}
                    </span>
                    <span className="list-row__subtitle">
                      {feed.articles.filter((a) => !a.isRead).length}/
                      {feed.articles.length}
                      {feed.hasError ? t("rss.errorTag") : ""}
                      {feed.isLoading ? t("rss.loadingTag") : ""}
                    </span>
                  </span>
                  <span className="list-row__chevron" aria-hidden>
                    <ChevronRightIcon size={16} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rss__detail">
            {selected ? (
              <>
                <div className="rss__detail-head">
                  <button
                    type="button"
                    className="btn btn--sm rss__back"
                    onClick={() => setPushed(false)}
                  >
                    <ChevronLeftIcon size={16} />
                    <span>{t("rss.back")}</span>
                  </button>
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
                          setPushed(false);
                        }, t("rss.removed"));
                      }}
                    >
                      <RemoveIcon />
                    </button>
                  </div>
                </div>

                <h2 className="rss__detail-title">
                  {selected.title || selected.path}
                </h2>
                <p className="hint rss__detail-url">
                  {selected.url || selected.path}
                </p>

                <p className="settings-group__header">
                  {t("rss.articlesSection")}
                </p>

                {selected.articles.length === 0 ? (
                  <p className="hint">{t("rss.noArticles")}</p>
                ) : (
                  <ul className="inset-group rss__articles">
                    {selected.articles.map((article) => (
                      <li
                        key={`${selected.path}:${article.id}:${article.title}`}
                        className={`list-row${article.isRead ? " list-row--muted" : ""}`}
                      >
                        <div className="list-row__body">
                          <p className="list-row__title">{article.title}</p>
                          {article.date ? (
                            <p className="list-row__subtitle">{article.date}</p>
                          ) : null}
                        </div>
                        <div className="list-row__trailing">
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
                            <DownloadIcon size={16} />
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
