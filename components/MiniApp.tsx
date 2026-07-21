"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddTorrentForm } from "@/components/AddTorrentForm";
import { I18nProvider, useI18n } from "@/components/I18nProvider";
import { ListToolbar } from "@/components/ListToolbar";
import { RssPanel } from "@/components/RssPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TorrentList } from "@/components/TorrentList";
import {
  addTorrentUrl,
  deleteTorrent,
  fetchSnapshot,
  fetchTorrents,
  pauseTorrent,
  resumeTorrent,
  setTorrentCategory,
} from "@/lib/client-api";
import { DEV_PREVIEW_INIT_DATA } from "@/lib/dev/preview";
import {
  detectLanguageCode,
  resolveLocale,
  translate,
} from "@/lib/i18n";
import {
  sortTorrents,
  torrentsEqual,
  type SortDir,
  type SortKey,
  type Torrent,
} from "@/lib/types";

const POLL_MS = 4000;
const DEV_PREVIEW =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_PREVIEW === "1";

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function MiniApp() {
  const [languageCode, setLanguageCode] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return detectLanguageCode();
  });

  return (
    <I18nProvider languageCode={languageCode}>
      <MiniAppInner onLanguageCode={setLanguageCode} />
    </I18nProvider>
  );
}

function MiniAppInner({
  onLanguageCode,
}: {
  onLanguageCode: (code: string | null) => void;
}) {
  const { t, locale } = useI18n();
  const [initData, setInitData] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [busyHash, setBusyHash] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("added_on");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"downloads" | "rss">("downloads");
  const refreshInflight = useRef(false);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const sortedTorrents = useMemo(
    () => sortTorrents(torrents, sortKey, sortDir),
    [torrents, sortKey, sortDir]
  );

  const refreshTorrents = useCallback(async (token: string) => {
    if (refreshInflight.current) return;
    refreshInflight.current = true;
    try {
      const { torrents: next } = await fetchTorrents(token);
      setTorrents((prev) => (torrentsEqual(prev, next) ? prev : next));
      setSelected((prev) => {
        if (prev.size === 0) return prev;
        const hashes = new Set(next.map((t) => t.hash));
        const kept = [...prev].filter((hash) => hashes.has(hash));
        return kept.length === prev.size ? prev : new Set(kept);
      });
      setListError(null);
    } finally {
      refreshInflight.current = false;
    }
  }, []);

  const applySnapshot = useCallback(
    (next: Torrent[], nextCategories: string[]) => {
      setTorrents((prev) => (torrentsEqual(prev, next) ? prev : next));
      setCategories((prev) =>
        prev.length === nextCategories.length &&
        prev.every((name, i) => name === nextCategories[i])
          ? prev
          : nextCategories
      );
      setSelected((prev) => {
        if (prev.size === 0) return prev;
        const hashes = new Set(next.map((t) => t.hash));
        const kept = [...prev].filter((hash) => hashes.has(hash));
        return kept.length === prev.size ? prev : new Set(kept);
      });
      setListError(null);
    },
    []
  );

  const refreshAll = useCallback(
    async (token: string) => {
      if (refreshInflight.current) return;
      refreshInflight.current = true;
      try {
        const { torrents: next, categories: nextCategories } =
          await fetchSnapshot(token);
        applySnapshot(next, nextCategories);
      } finally {
        refreshInflight.current = false;
      }
    },
    [applySnapshot]
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const { default: WebApp } = await import("@twa-dev/sdk");
        if (cancelled) return;

        WebApp.ready();
        WebApp.expand();

        const data = WebApp.initData;
        if (!data) {
          if (DEV_PREVIEW) {
            const code = detectLanguageCode();
            onLanguageCode(code);
            setInitData(DEV_PREVIEW_INIT_DATA);
            setUserName(
              translate(resolveLocale(code), "app.previewUser")
            );
            await refreshAll(DEV_PREVIEW_INIT_DATA);
            return;
          }
          setAuthError(t("app.noInitData"));
          return;
        }

        const user = WebApp.initDataUnsafe.user;
        const code = detectLanguageCode({
          telegramLanguageCode: user?.language_code,
          initData: data,
        });
        onLanguageCode(code);
        setInitData(data);
        setUserName(
          user?.first_name || user?.username || (user ? String(user.id) : null)
        );
        await refreshAll(data);
      } catch (err) {
        if (cancelled) return;
        if (DEV_PREVIEW) {
          try {
            const code = detectLanguageCode();
            onLanguageCode(code);
            setInitData(DEV_PREVIEW_INIT_DATA);
            setUserName(
              translate(resolveLocale(code), "app.previewUser")
            );
            await refreshAll(DEV_PREVIEW_INIT_DATA);
            return;
          } catch (previewErr) {
            setAuthError(
              errMessage(previewErr, t("app.previewInitFailed"))
            );
            return;
          }
        }
        setAuthError(errMessage(err, t("app.initFailed")));
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
    // Boot once; t/onLanguageCode are stable enough for first paint strings.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional single boot
  }, [refreshAll, onLanguageCode]);

  useEffect(() => {
    if (!initData || authError || tab !== "downloads") return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refreshTorrents(initData).catch((err) => {
        setListError(errMessage(err, t("app.refreshFailed")));
      });
    };

    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [initData, authError, refreshTorrents, tab, t]);

  async function withBusy(hash: string, action: () => Promise<void>) {
    if (!initData) return;
    setBusyHash(hash);
    try {
      await action();
      await refreshTorrents(initData);
    } catch (err) {
      setListError(errMessage(err, t("app.actionFailed")));
    } finally {
      setBusyHash(null);
    }
  }

  function toggleSelect(hash: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(hash)) next.delete(hash);
      else next.add(hash);
      return next;
    });
  }

  if (booting) {
    return (
      <main className="shell">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
          <ThemeToggle />
        </header>
        <p className="status">{t("app.loading")}</p>
      </main>
    );
  }

  if (authError || !initData) {
    return (
      <main className="shell">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
          <ThemeToggle />
        </header>
        <p className="error">{authError ?? t("app.unauthorized")}</p>
      </main>
    );
  }

  const selectedHashes = [...selected];

  return (
    <main className="shell">
      <header className="header">
        <div>
          <h1 className="title">qBittorrent</h1>
          {userName ? (
            <p className="hint">{t("app.hello", { name: userName })}</p>
          ) : null}
        </div>
        <div className="header__actions">
          <ThemeToggle />
          {tab === "downloads" ? (
            <button
              type="button"
              className="btn btn--icon"
              aria-label={t("app.refresh")}
              title={t("app.refresh")}
              onClick={() => {
                void refreshAll(initData).catch((err) => {
                  setListError(errMessage(err, t("app.refreshFailed")));
                });
              }}
            >
              <svg
                className="icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
            </button>
          ) : null}
        </div>
      </header>

      <nav className="tabs" aria-label={t("app.nav")}>
        <button
          type="button"
          className={`tabs__btn${tab === "downloads" ? " tabs__btn--active" : ""}`}
          onClick={() => setTab("downloads")}
        >
          {t("app.tab.downloads")}
        </button>
        <button
          type="button"
          className={`tabs__btn${tab === "rss" ? " tabs__btn--active" : ""}`}
          onClick={() => setTab("rss")}
        >
          {t("app.tab.rss")}
        </button>
      </nav>

      {listError ? <p className="error">{listError}</p> : null}

      {tab === "rss" ? (
        <RssPanel
          initData={initData}
          categories={categories}
          onAdded={() => {
            void refreshTorrents(initData).catch(() => {
              /* ignore */
            });
          }}
        />
      ) : (
        <>
          <ListToolbar
            sortKey={sortKey}
            sortDir={sortDir}
            selectionMode={selectionMode}
            selectedCount={selected.size}
            totalCount={sortedTorrents.length}
            busy={busyHash !== null}
            onSortKeyChange={setSortKey}
            onToggleSortDir={() =>
              setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            onToggleSelectionMode={() => {
              setSelectionMode((prev) => !prev);
              setSelected(new Set());
            }}
            onSelectAll={() =>
              setSelected(new Set(sortedTorrents.map((torrent) => torrent.hash)))
            }
            onClearSelection={() => setSelected(new Set())}
            onBatchPause={() =>
              void withBusy("*", () => pauseTorrent(initData, selectedHashes))
            }
            onBatchResume={() =>
              void withBusy("*", () => resumeTorrent(initData, selectedHashes))
            }
            onBatchDelete={(deleteFiles) =>
              void withBusy("*", async () => {
                await deleteTorrent(initData, selectedHashes, deleteFiles);
                setSelected(new Set());
              })
            }
          />

          <TorrentList
            torrents={sortedTorrents}
            categories={categories}
            busyHash={busyHash}
            selected={selected}
            selectionMode={selectionMode}
            onToggleSelect={toggleSelect}
            onPause={(hash) =>
              void withBusy(hash, () => pauseTorrent(initData, hash))
            }
            onResume={(hash) =>
              void withBusy(hash, () => resumeTorrent(initData, hash))
            }
            onDelete={(hash, deleteFiles) =>
              void withBusy(hash, () =>
                deleteTorrent(initData, hash, deleteFiles)
              )
            }
            onCategoryChange={(hash, category) =>
              void withBusy(hash, () =>
                setTorrentCategory(initData, hash, category)
              )
            }
          />

          <AddTorrentForm
            categories={categories}
            onSubmit={async (urls, category) => {
              await addTorrentUrl(initData, urls, category || undefined);
              await refreshAll(initData);
            }}
          />
        </>
      )}
    </main>
  );
}
