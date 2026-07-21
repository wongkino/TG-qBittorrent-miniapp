"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AddTorrentForm } from "@/components/AddTorrentForm";
import { useI18n } from "@/components/I18nProvider";
import { InstallBanner } from "@/components/InstallBanner";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ListToolbar } from "@/components/ListToolbar";
import { LoadingState } from "@/components/LoadingState";
import { OfflineState } from "@/components/OfflineState";
import { AddIcon } from "@/components/icons";
import { RssPanel } from "@/components/RssPanel";
import { Sheet } from "@/components/Sheet";
import { TabBar, type AppTab } from "@/components/TabBar";
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
import type { ClientAuth } from "@/lib/client-auth";
import {
  classifyClientError,
  errMessage,
} from "@/lib/client-errors";
import { filterTorrents, type StatusFilter } from "@/lib/format";
import {
  sortTorrents,
  torrentsEqual,
  type SortDir,
  type SortKey,
  type Torrent,
} from "@/lib/types";

const POLL_MS = 4000;
const COMPACT_SCROLL_Y = 48;
const PTR_THRESHOLD = 64;
const TAB_SWIPE_PX = 72;

export type SnapshotData = {
  torrents: Torrent[];
  categories: string[];
};

function pruneSelected(prev: Set<string>, hashes: Iterable<string>) {
  if (prev.size === 0) return prev;
  const alive = new Set(hashes);
  const kept = [...prev].filter((hash) => alive.has(hash));
  return kept.length === prev.size ? prev : new Set(kept);
}

type Props = {
  auth: ClientAuth;
  userName: string | null;
  initialSnapshot?: SnapshotData | null;
  onAuthExpired?: () => void;
};

export function QbDashboard({
  auth,
  userName,
  initialSnapshot = null,
  onAuthExpired,
}: Props) {
  const { t, locale } = useI18n();
  const [torrents, setTorrents] = useState<Torrent[]>(
    () => initialSnapshot?.torrents ?? []
  );
  const [categories, setCategories] = useState<string[]>(
    () => initialSnapshot?.categories ?? []
  );
  const [listError, setListError] = useState<string | null>(null);
  const [busyHash, setBusyHash] = useState<string | null>(null);
  const [booting, setBooting] = useState(!initialSnapshot);
  const [sortKey, setSortKey] = useState<SortKey>("added_on");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<AppTab>("downloads");
  const [compact, setCompact] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [ptrPull, setPtrPull] = useState(0);
  const [ptrRefreshing, setPtrRefreshing] = useState(false);
  const [online, setOnline] = useState(true);
  const [tabDir, setTabDir] = useState<"left" | "right">("left");
  const refreshInflight = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ptrStartY = useRef<number | null>(null);
  const ptrPulling = useRef(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const sync = () => {
      const next = navigator.onLine;
      setOnline(next);
      if (next) setListError(null);
    };
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const visibleTorrents = useMemo(
    () =>
      sortTorrents(filterTorrents(torrents, statusFilter), sortKey, sortDir),
    [torrents, statusFilter, sortKey, sortDir]
  );

  const handleError = useCallback(
    (err: unknown, fallbackKey: "app.refreshFailed" | "app.actionFailed") => {
      const kind = classifyClientError(err);
      if (kind === "auth") {
        onAuthExpired?.();
        return;
      }
      if (kind === "offline") {
        setOnline(false);
        setListError(t("pwa.offlineBanner"));
        return;
      }
      setListError(errMessage(err, t(fallbackKey)));
    },
    [onAuthExpired, t]
  );

  const applySnapshot = useCallback((next: SnapshotData) => {
    setTorrents((prev) =>
      torrentsEqual(prev, next.torrents) ? prev : next.torrents
    );
    setCategories((prev) =>
      prev.length === next.categories.length &&
      prev.every((name, i) => name === next.categories[i])
        ? prev
        : next.categories
    );
    setSelected((prev) =>
      pruneSelected(
        prev,
        next.torrents.map((item) => item.hash)
      )
    );
    setListError(null);
  }, []);

  const refreshTorrents = useCallback(async (session: ClientAuth) => {
    if (refreshInflight.current) return;
    refreshInflight.current = true;
    try {
      const { torrents: next } = await fetchTorrents(session);
      setTorrents((prev) => (torrentsEqual(prev, next) ? prev : next));
      setSelected((prev) =>
        pruneSelected(
          prev,
          next.map((item) => item.hash)
        )
      );
      setListError(null);
    } finally {
      refreshInflight.current = false;
    }
  }, []);

  const refreshAll = useCallback(
    async (session: ClientAuth) => {
      if (refreshInflight.current) return;
      refreshInflight.current = true;
      try {
        applySnapshot(await fetchSnapshot(session));
      } finally {
        refreshInflight.current = false;
      }
    },
    [applySnapshot]
  );

  const runRefresh = useCallback(async () => {
    try {
      await refreshAll(auth);
      setOnline(navigator.onLine);
    } catch (err) {
      handleError(err, "app.refreshFailed");
    }
  }, [auth, handleError, refreshAll]);

  function changeTab(next: AppTab, dir?: "left" | "right") {
    setTab((prev) => (prev === next ? prev : next));
    setTabDir(dir ?? (next === "rss" ? "left" : "right"));
    setMoreOpen(false);
    scrollRef.current?.scrollTo({ top: 0 });
    setCompact(false);
  }

  useEffect(() => {
    if (initialSnapshot) {
      setBooting(false);
      return;
    }
    let cancelled = false;
    void refreshAll(auth)
      .catch((err) => {
        if (!cancelled) handleError(err, "app.refreshFailed");
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth, handleError, initialSnapshot, refreshAll]);

  useEffect(() => {
    if (booting || tab !== "downloads") return;
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refreshTorrents(auth).catch((err) =>
        handleError(err, "app.refreshFailed")
      );
    };
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [auth, booting, handleError, refreshTorrents, tab]);

  async function withBusy(hash: string, action: () => Promise<void>) {
    setBusyHash(hash);
    try {
      await action();
      await refreshTorrents(auth);
    } catch (err) {
      handleError(err, "app.actionFailed");
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

  function onPtrDown(event: ReactPointerEvent<HTMLDivElement>) {
    swipeStart.current = { x: event.clientX, y: event.clientY };
    if (ptrRefreshing) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) return;
    ptrStartY.current = event.clientY;
    ptrPulling.current = true;
  }

  function onPtrMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!ptrPulling.current || ptrStartY.current == null) return;
    const el = scrollRef.current;
    if (!el || el.scrollTop > 0) {
      ptrPulling.current = false;
      setPtrPull(0);
      return;
    }
    setPtrPull(Math.min(Math.max(0, event.clientY - ptrStartY.current) * 0.45, 96));
  }

  async function onPtrUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start && !moreOpen && !addOpen) {
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) >= TAB_SWIPE_PX && Math.abs(dx) >= Math.abs(dy) * 1.4) {
        if (dx < 0 && tab === "downloads") changeTab("rss", "left");
        else if (dx > 0 && tab === "rss") changeTab("downloads", "right");
      }
    }

    if (!ptrPulling.current) return;
    ptrPulling.current = false;
    ptrStartY.current = null;
    const shouldRefresh = ptrPull >= PTR_THRESHOLD;
    setPtrPull(0);
    if (!shouldRefresh || ptrRefreshing) return;
    setPtrRefreshing(true);
    await runRefresh();
    setPtrRefreshing(false);
  }

  function resetPointers() {
    ptrPulling.current = false;
    ptrStartY.current = null;
    swipeStart.current = null;
    setPtrPull(0);
  }

  if (booting) {
    return (
      <main className="shell shell--app">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
        </header>
        <LoadingState />
      </main>
    );
  }

  const selectedHashes = [...selected];
  const ptrActive = ptrRefreshing || ptrPull > 8;
  const hello = userName ? (
    <div className="nav-trailing">
      <span className="nav-trailing__hello">
        {t("app.hello", { name: userName })}
      </span>
    </div>
  ) : null;

  const showOfflineEmpty = !online && torrents.length === 0;

  return (
    <main className="shell shell--app">
      <div
        className={`nav-compact${compact ? " nav-compact--visible" : ""}`}
        aria-hidden={!compact}
      >
        <span className="nav-compact__title">qBittorrent</span>
        {hello}
      </div>

      <div
        ref={scrollRef}
        className="shell__scroll"
        onScroll={() =>
          setCompact((scrollRef.current?.scrollTop ?? 0) > COMPACT_SCROLL_Y)
        }
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={(event) => void onPtrUp(event)}
        onPointerCancel={resetPointers}
      >
        <InstallBanner />

        {!online && torrents.length > 0 ? (
          <p className="offline-banner" role="status">
            {t("pwa.offlineBanner")}
          </p>
        ) : null}

        <div
          className={`ptr${ptrActive ? " ptr--active" : ""}`}
          style={{ height: ptrRefreshing ? 44 : ptrPull }}
          aria-hidden={!ptrActive}
        >
          <span className="ptr__label">
            {ptrRefreshing
              ? t("app.refreshing")
              : ptrPull >= PTR_THRESHOLD
                ? t("app.refresh")
                : t("app.pullToRefresh")}
          </span>
        </div>

        <header
          className={`header header--large${compact ? " header--faded" : ""}`}
        >
          <h1 className="title">qBittorrent</h1>
          {hello}
        </header>

        {listError && !showOfflineEmpty ? (
          <p className="error">{listError}</p>
        ) : null}

        {showOfflineEmpty ? (
          <OfflineState onRetry={() => void runRefresh()} />
        ) : (
          <div className={`tab-panel tab-panel--${tabDir}`} key={tab}>
            {tab === "rss" ? (
              <RssPanel
                key={auth.token}
                auth={auth}
                categories={categories}
                onAuthExpired={onAuthExpired}
                onAdded={() => {
                  void refreshTorrents(auth).catch(() => undefined);
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
                    void withBusy("*", () =>
                      resumeTorrent(auth, selectedHashes)
                    )
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
                    void withBusy(hash, () =>
                      deleteTorrent(auth, hash, deleteFiles)
                    )
                  }
                  onCategoryChange={(hash, category) =>
                    void withBusy(hash, () =>
                      setTorrentCategory(auth, hash, category)
                    )
                  }
                />
              </>
            )}
          </div>
        )}
      </div>

      {tab === "downloads" && online ? (
        <button
          type="button"
          className="fab"
          aria-label={t("add.fab")}
          title={t("add.fab")}
          onClick={() => setAddOpen(true)}
        >
          <AddIcon size={24} />
        </button>
      ) : null}

      <TabBar
        tab={tab}
        moreOpen={moreOpen}
        onTabChange={(next) => changeTab(next)}
        onMore={() => setMoreOpen(true)}
      />

      {addOpen ? (
        <Sheet title={t("add.title")} onClose={() => setAddOpen(false)}>
          <AddTorrentForm
            categories={categories}
            onSuccess={() => setAddOpen(false)}
            onSubmit={async (urls, category) => {
              await addTorrentUrl(auth, urls, category || undefined);
              await refreshAll(auth);
            }}
          />
        </Sheet>
      ) : null}

      {moreOpen ? (
        <Sheet title={t("more.title")} onClose={() => setMoreOpen(false)}>
          <div className="settings-group">
            <p className="settings-group__header">{t("more.appearance")}</p>
            <div className="settings-group__card more-sheet__row">
              <ThemeToggle />
              <LanguageToggle placement="right" />
            </div>
          </div>
        </Sheet>
      ) : null}
    </main>
  );
}
