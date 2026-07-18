"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AddTorrentForm } from "@/components/AddTorrentForm";
import { TorrentList } from "@/components/TorrentList";
import {
  addTorrentUrl,
  deleteTorrent,
  fetchTorrents,
  pauseTorrent,
  resumeTorrent,
} from "@/lib/client-api";
import { torrentsEqual, type Torrent } from "@/lib/types";

const POLL_MS = 4000;

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function MiniApp() {
  const [initData, setInitData] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [busyHash, setBusyHash] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const refreshInflight = useRef(false);

  const refresh = useCallback(async (token: string) => {
    if (refreshInflight.current) return;
    refreshInflight.current = true;
    try {
      const { torrents: next } = await fetchTorrents(token);
      setTorrents((prev) => (torrentsEqual(prev, next) ? prev : next));
      setListError(null);
    } finally {
      refreshInflight.current = false;
    }
  }, []);

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
        await refresh(data);
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
  }, [refresh]);

  useEffect(() => {
    if (!initData || authError) return;

    const tick = () => {
      if (document.visibilityState === "hidden") return;
      void refresh(initData).catch((err) => {
        setListError(errMessage(err, "重新整理失敗"));
      });
    };

    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [initData, authError, refresh]);

  async function withBusy(hash: string, action: () => Promise<void>) {
    if (!initData) return;
    setBusyHash(hash);
    try {
      await action();
      await refresh(initData);
    } catch (err) {
      setListError(errMessage(err, "操作失敗"));
    } finally {
      setBusyHash(null);
    }
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
            void refresh(initData).catch((err) => {
              setListError(errMessage(err, "重新整理失敗"));
            });
          }}
        >
          重新整理
        </button>
      </header>

      {listError ? <p className="error">{listError}</p> : null}

      <TorrentList
        torrents={torrents}
        busyHash={busyHash}
        onPause={(hash) =>
          void withBusy(hash, () => pauseTorrent(initData, hash))
        }
        onResume={(hash) =>
          void withBusy(hash, () => resumeTorrent(initData, hash))
        }
        onDelete={(hash, deleteFiles) =>
          void withBusy(hash, () => deleteTorrent(initData, hash, deleteFiles))
        }
      />

      <AddTorrentForm
        onSubmit={async (urls) => {
          await addTorrentUrl(initData, urls);
          await refresh(initData);
        }}
      />
    </main>
  );
}
