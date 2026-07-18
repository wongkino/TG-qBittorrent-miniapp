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
│  worker.ts = OpenNext fetch + scheduled()       │
│  /api/qb/*   /api/telegram/webhook               │
│  /api/cron/completions                           │
│  Cron Trigger */5 * * * * ──► scheduled()        │
└───────────────────────┬─────────────────────────┘
                        │ Web API + CSRF headers
                        ▼
              ┌───────────────────┐
              │   qBittorrent     │
              │  QBITTORRENT_URL  │
              └───────────────────┘

GitHub Actions ──deploy──► Worker + secrets + setWebhook/MenuButton
Cloudflare Cron ─────────► worker.scheduled() → /api/cron/completions
```

技術棧：Next.js App Router、React、TypeScript、`@opennextjs/cloudflare`、`@twa-dev/sdk`、Wrangler。

入口：`worker.ts`（自訂 Worker，包裝 `.open-next/worker.js` 並加上 `scheduled`）。

---

## 目錄結構

```
worker.ts                  # Cloudflare 入口（fetch + cron）
wrangler.jsonc             # triggers.crons = */5 * * * *
app/
  page.tsx                 # 掛載 MiniApp
  layout.tsx               # zh-Hant、viewport
  globals.css
  api/qb/*/route.ts        # Mini App 後端代理
  api/telegram/webhook/    # Bot webhook
  api/cron/completions/    # 開始／完成通知（Cron 與手動 HTTP）
components/                # Mini App UI
lib/                       # 共用邏輯（見下）
.github/workflows/         # Deploy only
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

多 hash 以 `|` 串接。Mini App 約每 4 秒輪詢種子列表（頁面隱藏時跳過）；開機／手動重整／加種後用 `/api/qb/snapshot` 一次取 torrents+categories。

### 2. Bot webhook

Telegram → `POST {APP_URL}/api/telegram/webhook`  
Header：`X-Telegram-Bot-Api-Secret-Token: <CRON_SECRET>`  
→ `lib/bot-handler.ts` → qBittorrent 與／或回覆訊息

### 3. 通知 cron（Cloudflare）

`wrangler.jsonc` → `triggers.crons: ["*/5 * * * *"]`  
→ `worker.ts` `scheduled()`  
→ 內部呼叫 OpenNext `fetch` → `POST /api/cron/completions`（Bearer `CRON_SECRET`）  
→ `lib/completions.ts`

也可手動：

```http
POST {APP_URL}/api/cron/completions
Authorization: Bearer <CRON_SECRET>
```

| 事件 | 條件 | Tag |
|------|------|-----|
| 下載開始 | `added_on` ≤ 15 分鐘，未完成 | `tg-started` |
| 下載完成 | `completion_on` ≤ 15 分鐘，進度完成 | `tg-notified` |

---

## 認證模型

| 介面 | 機制 |
|------|------|
| `/api/qb/*` | `Authorization: tma <initData>`；HMAC；白名單 |
| Webhook | `secret_token` = `CRON_SECRET` |
| Cron HTTP／scheduled 內部請求 | `Bearer CRON_SECRET` |
| 白名單 | `ALLOWED_TELEGRAM_USER_IDS` |

---

## 核心模組

| 模組 | 職責 |
|------|------|
| `worker.ts` | Cloudflare 入口：fetch + scheduled |
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

## 重要實作細節

### qBittorrent CSRF／登入

- 嚴格 `Origin`／`Referer`；預設埠會剝除
- Form login 不帶 Basic Auth；之後可帶 SID + Basic
- Process 內 session 快取約 55 分鐘

### `APP_URL` vs `QBITTORRENT_URL`

- `APP_URL`：Deploy 設 webhook／Menu Button（Actions Variable；Worker runtime 不需）
- `QBITTORRENT_URL`：後端代理目標（Worker secret）
- 通知 cron **不再**依賴 `APP_URL`（在 Worker 內觸發）

### 能力邊界

- Mini App：無本機 `.torrent` 檔上傳；可用 **瀏覽** 分頁代理網頁並攔截 magnet／.torrent
- 瀏覽代理：SSRF 防護；可選 `BROWSE_ALLOWED_HOSTS`；部分站點可能無法完整渲染
- Bot：可收檔；`allowed_updates` 僅 `message`
