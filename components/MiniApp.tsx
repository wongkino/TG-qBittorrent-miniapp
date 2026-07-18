"use client";

import { useCallback, useEffect, useState } from "react";
import { AddTorrentForm } from "@/components/AddTorrentForm";
import { TorrentList } from "@/components/TorrentList";
import {
  addTorrentUrl,
  deleteTorrent,
  fetchMe,
  fetchTorrents,
  pauseTorrent,
  resumeTorrent,
  type Torrent,
} from "@/lib/client-api";

const POLL_MS = 4000;

export function MiniApp() {
  const [initData, setInitData] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [busyHash, setBusyHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function initTelegram() {
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
          setReady(true);
          setLoading(false);
          return;
        }
        setInitData(data);
        setReady(true);
      } catch {
        if (!cancelled) {
          setAuthError("Telegram WebApp SDK 初始化失敗");
          setReady(true);
          setLoading(false);
        }
      }
    }

    void initTelegram();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async (token: string) => {
    const { torrents: next } = await fetchTorrents(token);
    setTorrents(next);
    setListError(null);
  }, []);

  useEffect(() => {
    if (!initData) return;

    let cancelled = false;

    async function bootstrap() {
      try {
        const me = await fetchMe(initData!);
        if (cancelled) return;
        setUserName(me.user.first_name || me.user.username || String(me.user.id));
        await refresh(initData!);
      } catch (err) {
        if (!cancelled) {
          setAuthError(err instanceof Error ? err.message : "驗證失敗");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [initData, refresh]);

  useEffect(() => {
    if (!initData || authError) return;

    const id = window.setInterval(() => {
      void refresh(initData).catch((err) => {
        setListError(err instanceof Error ? err.message : "重新整理失敗");
      });
    }, POLL_MS);

    return () => window.clearInterval(id);
  }, [initData, authError, refresh]);

  async function withBusy(hash: string, action: () => Promise<void>) {
    if (!initData) return;
    setBusyHash(hash);
    try {
      await action();
      await refresh(initData);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setBusyHash(null);
    }
  }

  if (!ready || loading) {
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
              setListError(err instanceof Error ? err.message : "重新整理失敗");
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
