import type { Torrent } from "@/lib/types";
import type { ClientRssFeed } from "@/lib/client-api";
import { env } from "@/lib/env";

/** Sent as `Authorization: tma <this>` in local preview. */
export const DEV_PREVIEW_INIT_DATA = "dev-preview";

/** Only when Next is in development and both flags are set. */
export function isDevPreviewEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    env("DEV_PREVIEW") === "1" &&
    process.env.NEXT_PUBLIC_DEV_PREVIEW === "1"
  );
}

export function isDevPreviewInitData(initData: string | null | undefined): boolean {
  return (
    isDevPreviewEnabled() &&
    typeof initData === "string" &&
    initData.trim() === DEV_PREVIEW_INIT_DATA
  );
}

export function mockTorrents(): Torrent[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      hash: "previewhash0001",
      name: "範例種子 — 下載中",
      size: 4_294_967_296,
      progress: 0.42,
      dlspeed: 2_500_000,
      upspeed: 120_000,
      state: "downloading",
      eta: 1800,
      category: "電影",
      added_on: now - 600,
    },
    {
      hash: "previewhash0002",
      name: "範例種子 — 已暫停",
      size: 1_073_741_824,
      progress: 0.15,
      dlspeed: 0,
      upspeed: 0,
      state: "pausedDL",
      eta: 8640000,
      category: "",
      added_on: now - 3600,
    },
    {
      hash: "previewhash0003",
      name: "範例種子 — 做種中",
      size: 838_860_800,
      progress: 1,
      dlspeed: 0,
      upspeed: 450_000,
      state: "uploading",
      eta: 8640000,
      category: "動畫",
      added_on: now - 86400,
    },
  ];
}

export function mockCategories(): string[] {
  return ["電影", "動畫", "音樂"];
}

export function mockRssFeeds(): ClientRssFeed[] {
  return [
    {
      path: "預覽訂閱",
      title: "預覽訂閱",
      url: "https://example.com/feed.xml",
      hasError: false,
      isLoading: false,
      articles: [
        {
          id: "a1",
          title: "預覽文章 A",
          date: "今天",
          torrentUrl: "magnet:?xt=urn:btih:preview",
          link: "https://example.com/a",
          isRead: false,
        },
        {
          id: "a2",
          title: "預覽文章 B（已讀）",
          date: "昨天",
          torrentUrl: "https://example.com/b.torrent",
          link: "https://example.com/b",
          isRead: true,
        },
      ],
    },
  ];
}
