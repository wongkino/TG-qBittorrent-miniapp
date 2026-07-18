# 架構說明

## 總覽

```
┌─────────────────────┐     ┌─────────────────────┐
│  Telegram Mini App  │     │    Telegram Bot     │
│  (WebView + SDK)    │     │  指令 / magnet / 檔  │
└─────────┬───────────┘     └──────────┬──────────┘
          │ tma initData                │ webhook + secret_token
          ▼                             ▼
┌─────────────────────────────────────────────────┐
│     Cloudflare Worker `tg-dl` (Next.js)         │
│  /api/qb/*   /api/telegram/webhook               │
│  /api/cron/completions                           │
└───────────────────────┬─────────────────────────┘
                        │ Web API + CSRF headers
                        ▼
              ┌───────────────────┐
              │   qBittorrent     │
              │  QBITTORRENT_URL  │
              └───────────────────┘

GitHub Actions ──deploy──► Worker + secrets + setWebhook/MenuButton
GitHub Actions ──cron───► POST /api/cron/completions
```

技術棧：Next.js App Router、React、TypeScript、`@opennextjs/cloudflare`、`@twa-dev/sdk`、Wrangler。

---

## 目錄結構

```
app/
  page.tsx                 # 掛載 MiniApp
  layout.tsx               # zh-Hant、viewport
  globals.css
  api/qb/*/route.ts        # Mini App 後端代理
  api/telegram/webhook/    # Bot webhook
  api/cron/completions/    # 開始／完成通知
components/                # Mini App UI
lib/                       # 共用邏輯（見下）
.github/workflows/         # Deploy + 通知 cron
```

---

## 三條請求流

### 1. Mini App

`components/MiniApp.tsx` → `lib/client-api.ts` → `app/api/qb/*` → `lib/qbittorrent.ts` → qBittorrent

| Client | Route | qBittorrent |
|--------|-------|------------|
| `fetchTorrents` | `GET /api/qb/torrents` | `GET /api/v2/torrents/info` |
| `fetchCategories` | `GET /api/qb/categories` | `GET /api/v2/torrents/categories` |
| `addTorrentUrl` | `POST /api/qb/add` | `POST /api/v2/torrents/add` |
| `pauseTorrent` | `POST /api/qb/pause` | `stop` → `pause` |
| `resumeTorrent` | `POST /api/qb/resume` | `start` → `resume` |
| `deleteTorrent` | `POST /api/qb/delete` | `POST /api/v2/torrents/delete` |
| `setTorrentCategory` | `POST /api/qb/category` | `POST /api/v2/torrents/setCategory` |

多 hash 以 `|` 串接。Mini App 約每 4 秒輪詢（頁面隱藏時跳過）。

### 2. Bot webhook

Telegram → `POST {APP_URL}/api/telegram/webhook`  
Header：`X-Telegram-Bot-Api-Secret-Token: <CRON_SECRET>`  
→ `lib/bot-handler.ts` → qBittorrent 與／或回覆訊息

支援：Reply Keyboard（狀態／列表／說明）、magnet、torrent URL、`.torrent` 檔、舊式 `/status` 等指令。

### 3. 通知 cron

GitHub Actions（每 2 分鐘）→ `POST {APP_URL}/api/cron/completions`  
`Authorization: Bearer <CRON_SECRET>` → `lib/completions.ts`

| 事件 | 條件 | Tag |
|------|------|-----|
| 下載開始 | `added_on` ≤ 15 分鐘，未完成 | `tg-started` |
| 下載完成 | `completion_on` ≤ 15 分鐘，進度完成 | `tg-notified` |

---

## 認證模型

| 介面 | 機制 |
|------|------|
| `/api/qb/*` | `Authorization: tma <initData>`；HMAC（WebAppData + bot token）；`auth_date` 24h；user ∈ 白名單 |
| Webhook | `secret_token` = `CRON_SECRET` |
| Cron | `Bearer CRON_SECRET` |
| 白名單 | `ALLOWED_TELEGRAM_USER_IDS`（逗號分隔） |

`CRON_SECRET` 同時用於 webhook 與 cron，Deploy 時一併設定。

---

## 核心模組

| 模組 | 職責 |
|------|------|
| `lib/env.ts` | env 讀取、白名單解析 |
| `lib/telegram.ts` | Mini App initData 驗證 |
| `lib/telegram-bot.ts` | Bot API、通知文案 |
| `lib/bot-handler.ts` | Bot 訊息處理 |
| `lib/qbittorrent.ts` | Session、CSRF、CRUD、tags |
| `lib/completions.ts` | 開始／完成通知邏輯 |
| `lib/client-api.ts` | 前端 API client |
| `lib/api.ts` | Route 共用 auth／錯誤／hashes |
| `lib/types.ts` / `format.ts` | 型別、排序、顯示格式 |

---

## UI 元件

| 元件 | 功能 |
|------|------|
| `MiniApp` | 初始化 WebApp、輪詢、狀態列 |
| `ListToolbar` | 排序、批次操作 |
| `TorrentList` / `TorrentRow` | 列表與單筆操作 |
| `AddTorrentForm` | 加 URL／剪貼簿 |
| `CategorySelect` | 分類下拉 |

---

## 重要實作細節

### qBittorrent CSRF／登入

- 嚴格 `Origin`／`Referer`；預設埠會剝除以免 Origin 比對失敗
- Form login 不帶 Basic Auth；之後請求可同時帶 SID + Basic
- Process 內 session 快取約 55 分鐘（Workers 冷啟動可能重登）

### `APP_URL` vs `QBITTORRENT_URL`

- `APP_URL`：對外的 Mini App／Webhook 位址（Actions 用）
- `QBITTORRENT_URL`：後端實際代理目標（Worker secret）

### 能力邊界

- Mini App：無 `.torrent` 檔上傳
- Bot：可收檔；`allowed_updates` 僅 `message`
