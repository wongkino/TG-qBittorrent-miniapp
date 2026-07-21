"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AddTorrentForm } from "@/components/AddTorrentForm";
import { useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ListToolbar } from "@/components/ListToolbar";
import { RefreshIcon } from "@/components/icons";
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
  syncUserLocale,
} from "@/lib/client-api";
import type { ClientAuth } from "@/lib/client-auth";
import { AuthSessionError } from "@/lib/client-auth";
import { filterTorrents, type StatusFilter } from "@/lib/format";
import {
  sortTorrents,
  torrentsEqual,
  type SortDir,
  type SortKey,
  type Torrent,
} from "@/lib/types";

const POLL_MS = 4000;

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function isAuthExpired(err: unknown): boolean {
  return err instanceof AuthSessionError;
}

function HeaderTools({ extra }: { extra?: ReactNode }) {
  return (
    <div className="header__actions">
      <LanguageToggle />
      <ThemeToggle />
      {extra}
    </div>
  );
}

type Props = {
  auth: ClientAuth;
  userName: string | null;
  onAuthExpired?: () => void;
};

export function QbDashboard({ auth, userName, onAuthExpired }: Props) {
  const { t, locale } = useI18n();
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [busyHash, setBusyHash] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("added_on");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"downloads" | "rss">("downloads");
  const refreshInflight = useRef(false);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    void syncUserLocale(auth, locale).catch(() => {
      /* KV sync is best-effort */
    });
  }, [auth, locale]);

  const visibleTorrents = useMemo(
    () =>
      sortTorrents(
        filterTorrents(torrents, statusFilter),
        sortKey,
        sortDir
      ),
    [torrents, statusFilter, sortKey, sortDir]
  );

  const refreshTorrents = useCallback(async (session: ClientAuth) => {
    if (refreshInflight.current) return;
    refreshInflight.current = true;
    try {
      const { torrents: next } = await fetchTorrents(session);
      setTorrents((prev) => (torrentsEqual(prev, next) ? prev : next));
      setSelected((prev) => {
        if (prev.size === 0) return prev;
        const hashes = new Set(next.map((item) => item.hash));
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
        const hashes = new Set(next.map((item) => item.hash));
        const kept = [...prev].filter((hash) => hashes.has(hash));
        return kept.length === prev.size ? prev : new Set(kept);
      });
      setListError(null);
    },
    []
  );

  const refreshAll = useCallback(
    async (session: ClientAuth) => {
      if (refreshInflight.current) return;
      refreshInflight.current = true;
      try {
        const { torrents: next, categories: nextCategories } =
          await fetchSnapshot(session);
        applySnapshot(next, nextCategories);
      } finally {
        refreshInflight.current = false;
      }
    },
    [applySnapshot]
  );

  useEffect(() => {
    let cancelled = false;

    void refreshAll(auth)
      .catch((err) => {
        if (!cancelled) {
          if (isAuthExpired(err)) {
            onAuthExpired?.();
            return;
          }
          setListError(errMessage(err, t("app.refreshFailed")));
        }
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [auth, onAuthExpired, refreshAll, t]);

  useEffect(() => {
    if (booting || tab !== "downloads") return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refreshTorrents(auth).catch((err) => {
        if (isAuthExpired(err)) {
          onAuthExpired?.();
          return;
        }
        setListError(errMessage(err, t("app.refreshFailed")));
      });
    };

    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [auth, booting, onAuthExpired, refreshTorrents, tab, t]);

  async function withBusy(hash: string, action: () => Promise<void>) {
    setBusyHash(hash);
    try {
      await action();
      await refreshTorrents(auth);
    } catch (err) {
      if (isAuthExpired(err)) {
        onAuthExpired?.();
        return;
      }
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
          <HeaderTools />
        </header>
        <p className="status">{t("app.loading")}</p>
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
        <HeaderTools
          extra={
            tab === "downloads" ? (
              <button
                type="button"
                className="btn btn--icon"
                aria-label={t("app.refresh")}
                title={t("app.refresh")}
                onClick={() => {
                  void refreshAll(auth).catch((err) => {
                    if (isAuthExpired(err)) {
                      onAuthExpired?.();
                      return;
                    }
                    setListError(errMessage(err, t("app.refreshFailed")));
                  });
                }}
              >
                <RefreshIcon />
              </button>
            ) : null
          }
        />
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
          key={auth.token}
          auth={auth}
          categories={categories}
          onAuthExpired={onAuthExpired}
          onAdded={() => {
            void refreshTorrents(auth).catch(() => {
              /* ignore */
            });
          }}
        />
      ) : (
        <>
          <ListToolbar
            sortKey={sortKey}
            sortDir={sortDir}
            statusFilter={statusFilter}
            selectionMode={selectionMode}
            selectedCount={selected.size}
            totalCount={visibleTorrents.length}
            busy={busyHash !== null}
            onSortKeyChange={setSortKey}
            onToggleSortDir={() =>
              setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            onStatusFilterChange={setStatusFilter}
            onToggleSelectionMode={() => {
              setSelectionMode((prev) => !prev);
              setSelected(new Set());
            }}
            onSelectAll={() =>
              setSelected(
                new Set(visibleTorrents.map((torrent) => torrent.hash))
              )
            }
            onClearSelection={() => setSelected(new Set())}
            onBatchPause={() =>
              void withBusy("*", () => pauseTorrent(auth, selectedHashes))
            }
            onBatchResume={() =>
              void withBusy("*", () => resumeTorrent(auth, selectedHashes))
            }
            onBatchDelete={(deleteFiles) =>
              void withBusy("*", async () => {
                await deleteTorrent(auth, selectedHashes, deleteFiles);
                setSelected(new Set());
              })
            }
          />

          <TorrentList
            torrents={visibleTorrents}
            categories={categories}
            busyHash={busyHash}
            selected={selected}
            selectionMode={selectionMode}
            filterActive={statusFilter !== "all"}
            onToggleSelect={toggleSelect}
            onPause={(hash) =>
              void withBusy(hash, () => pauseTorrent(auth, hash))
            }
            onResume={(hash) =>
              void withBusy(hash, () => resumeTorrent(auth, hash))
            }
            onDelete={(hash, deleteFiles) =>
              void withBusy(hash, () => deleteTorrent(auth, hash, deleteFiles))
            }
            onCategoryChange={(hash, category) =>
              void withBusy(hash, () =>
                setTorrentCategory(auth, hash, category)
              )
            }
          />

          <AddTorrentForm
            categories={categories}
            onSubmit={async (urls, category) => {
              await addTorrentUrl(auth, urls, category || undefined);
              await refreshAll(auth);
            }}
          />
        </>
      )}
    </main>
  );
}
