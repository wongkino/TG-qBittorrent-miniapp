"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddTorrentForm } from "@/components/AddTorrentForm";
import { ListToolbar } from "@/components/ListToolbar";
import { TorrentList } from "@/components/TorrentList";
import {
  addTorrentUrl,
  deleteTorrent,
  fetchCategories,
  fetchTorrents,
  pauseTorrent,
  resumeTorrent,
  setTorrentCategory,
} from "@/lib/client-api";
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

export function MiniApp() {
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
  const refreshInflight = useRef(false);

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

  const loadCategories = useCallback(async (token: string) => {
    const { categories: nextCategories } = await fetchCategories(token);
    setCategories((prev) =>
      prev.length === nextCategories.length &&
      prev.every((name, i) => name === nextCategories[i])
        ? prev
        : nextCategories
    );
  }, []);

  const refreshAll = useCallback(
    async (token: string) => {
      await Promise.all([refreshTorrents(token), loadCategories(token)]);
    },
    [refreshTorrents, loadCategories]
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
          setAuthError(
            "無法取得 Telegram initData。請從 Telegram Bot 內開啟此 Mini App。"
          );
          return;
        }

        const user = WebApp.initDataUnsafe.user;
        setInitData(data);
        setUserName(
          user?.first_name || user?.username || (user ? String(user.id) : null)
        );
        await refreshAll(data);
      } catch (err) {
        if (!cancelled) {
          setAuthError(errMessage(err, "初始化失敗"));
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [refreshAll]);

  useEffect(() => {
    if (!initData || authError) return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refreshTorrents(initData).catch((err) => {
        setListError(errMessage(err, "重新整理失敗"));
      });
    };

    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [initData, authError, refreshTorrents]);

  async function withBusy(
    hash: string,
    action: () => Promise<void>
  ) {
    if (!initData) return;
    setBusyHash(hash);
    try {
      await action();
      await refreshTorrents(initData);
    } catch (err) {
      setListError(errMessage(err, "操作失敗"));
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
        <p className="status">載入中…</p>
      </main>
    );
  }

  if (authError || !initData) {
    return (
      <main className="shell">
        <h1 className="title">qBittorrent</h1>
        <p className="error">{authError ?? "未授權"}</p>
      </main>
    );
  }

  const selectedHashes = [...selected];

  return (
    <main className="shell">
      <header className="header">
        <div>
          <h1 className="title">qBittorrent</h1>
          {userName ? <p className="hint">你好，{userName}</p> : null}
        </div>
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => {
            void refreshAll(initData).catch((err) => {
              setListError(errMessage(err, "重新整理失敗"));
            });
          }}
        >
          重新整理
        </button>
      </header>

      {listError ? <p className="error">{listError}</p> : null}

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
          setSelected(new Set(sortedTorrents.map((t) => t.hash)))
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
          void withBusy(hash, () => deleteTorrent(initData, hash, deleteFiles))
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
    </main>
  );
}
