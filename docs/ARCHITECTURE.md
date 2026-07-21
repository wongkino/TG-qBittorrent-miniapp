# 架構說明

## 總覽

```
┌─────────────────────┐     ┌─────────────────────┐
│      Web App        │     │    Telegram Bot     │
│  下載 / RSS         │     │  指令 / magnet / 檔  │
│  (Google OAuth)     │     │  (跟 Web App 語系)   │
└─────────┬───────────┘     └──────────┬──────────┘
          │ Bearer Google ID token      │ webhook + secret_token
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

技術棧：Next.js App Router、React、TypeScript、`@opennextjs/cloudflare`、Wrangler、Google Identity Services、`jose`（JWT 驗證）。

入口：`worker.ts`（包裝 `.open-next/worker.js` 並加上 `scheduled`）。

---

## 目錄結構

```
worker.ts                     # Cloudflare 入口（fetch + cron）
wrangler.jsonc                # triggers.crons = */5 * * * *
env/                          # dev／prod 環境變數範本（見 env/README.md）
app/
  page.tsx                    # 掛載 WebApp
  layout.tsx                  # viewport、PWA meta、主題 boot script
  globals.css                 # Apple 風 UI + data-theme 日間／夜間
  api/qb/*/route.ts           # Web App 後端代理（含 snapshot、rss）
  api/telegram/webhook/       # Bot webhook
  api/cron/completions/       # 開始／完成通知
components/                   # Web App UI（client）
  WebApp.tsx                  # Google 登入 + 掛載 QbDashboard
  GoogleSignIn.tsx            # Google Identity Services 按鈕
  QbDashboard.tsx             # 分頁：下載／RSS；語系／主題切換
  I18nProvider.tsx            # 英／繁中／簡中／日文
  LanguageToggle.tsx          # EN／繁／简／日
  ThemeToggle.tsx             # 日間／夜間
  icons.tsx                   # 共用 SVG 圖示
lib/
  qbittorrent.ts              # 唯一直接打 qB 的模組
  auth.ts / google-auth.ts    # Google ID token 驗證（含 dev-preview）
  google-session.ts           # 瀏覽器端 credential 存取
  client-api.ts               # 瀏覽器 → /api/qb/*（含 locale 同步）
  telegram-bot.ts / bot-handler.ts
  completions.ts / api.ts / env.ts / i18n.ts / theme.ts / user-locale.ts
  dev/preview.ts              # DEV_PREVIEW 假資料（僅 development）
public/
  manifest.webmanifest        # PWA manifest
  icon.svg                    # App icon
docs/                         # 使用者／部署／架構／開發
.github/workflows/            # Deploy only
```

**已移除：** Telegram Mini App、`@twa-dev/sdk`、`lib/telegram.ts`、內嵌瀏覽代理。

---

## 三條請求流

### 1. Web App

`components/WebApp.tsx` → `components/QbDashboard.tsx` → `lib/client-api.ts` → `app/api/qb/*` → `lib/qbittorrent.ts` → qBittorrent

| Client | Route | qBittorrent |
|--------|-------|------------|
| `fetchSnapshot` | `GET /api/qb/snapshot` | torrents + categories |
| `fetchTorrents` | `GET /api/qb/torrents` | `GET /api/v2/torrents/info` |
| `fetchCategories` | `GET /api/qb/categories` | `GET /api/v2/torrents/categories` |
| `addTorrentUrl` | `POST /api/qb/add` | `POST /api/v2/torrents/add` |
| `pauseTorrent` | `POST /api/qb/pause` | `stop` → `pause` |
| `resumeTorrent` | `POST /api/qb/resume` | `start` → `resume` |
| `deleteTorrent` | `POST /api/qb/delete` | `POST /api/v2/torrents/delete` |
| `setTorrentCategory` | `POST /api/qb/category` | `POST /api/v2/torrents/setCategory` |
| `fetchRssFeeds` | `GET /api/qb/rss` | `GET /api/v2/rss/items` 等 |
| `addRssFeed` | `POST /api/qb/rss/add` | RSS addFeed |
| `removeRssFeed` | `POST /api/qb/rss/remove` | RSS removeItem |
| `refreshRssFeed` | `POST /api/qb/rss/refresh` | RSS refreshItem |
| `markRssRead` | `POST /api/qb/rss/read` | RSS markAsRead |

多 hash 以 `|` 串接。下載分頁約每 4 秒輪詢（頁面隱藏時跳過）；開機／手動重整／加種後用 `snapshot`。

語系：App 內手動切換（`LanguageToggle`，存 `localStorage`）；切換後同步到 Worker KV（`USER_PREFS`），Bot 回覆與完成通知跟同一語系。見 `lib/i18n.ts`、`lib/user-locale.ts`。

主題：`data-theme=light|dark`（`lib/theme.ts`），預設夜間，可切換並存 localStorage。

### 2. Bot webhook

Telegram → `POST {APP_URL}/api/telegram/webhook`  
Header：`X-Telegram-Bot-Api-Secret-Token: <CRON_SECRET>`  
→ `lib/bot-handler.ts` → qBittorrent 與／或回覆訊息

### 3. 通知 cron（Cloudflare）

`wrangler.jsonc` → `triggers.crons: ["*/5 * * * *"]`  
→ `worker.ts` `scheduled()`  
→ 內部 `POST /api/cron/completions`（Bearer `CRON_SECRET`）  
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
| `/api/qb/*` | `Authorization: Bearer <Google ID token>`；JWT 驗證；`ALLOWED_GOOGLE_EMAILS` 白名單 |
| Webhook | `secret_token` = `CRON_SECRET` |
| Cron HTTP／scheduled 內部請求 | `Bearer CRON_SECRET` |
| 本機 `DEV_PREVIEW` | `Bearer dev-preview`（僅 `NODE_ENV=development`） |
| Bot 白名單 | `ALLOWED_TELEGRAM_USER_IDS` |

Web App 與 Bot 使用不同白名單（email vs Telegram user ID），皆為個人工具設定。

---

## 核心模組

| 模組 | 職責 |
|------|------|
| `worker.ts` | Cloudflare 入口：fetch + scheduled |
| `lib/env.ts` | env 讀取、白名單解析 |
| `lib/auth.ts` / `lib/google-auth.ts` | Google ID token 驗證（含 preview） |
| `lib/google-session.ts` | 瀏覽器 credential 存取、standalone 偵測 |
| `lib/telegram-bot.ts` | Bot API、通知文案 |
| `lib/bot-handler.ts` | Bot 訊息處理 |
| `lib/qbittorrent.ts` | Session、CSRF、CRUD、RSS、tags |
| `lib/completions.ts` | 開始／完成通知邏輯 |
| `lib/client-api.ts` | 前端 API client |
| `lib/api.ts` | Route 共用 auth／preview／錯誤／hashes |
| `lib/i18n.ts` | Web App 多語字串與 `resolveLocale` |
| `lib/theme.ts` | 日間／夜間 |
| `lib/dev/preview.ts` | 本機預覽假資料 |
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
- 通知 cron **不**依賴 `APP_URL`（在 Worker 內觸發）

### 環境變數擺放

| 環境 | 位置 |
|------|------|
| 本機 Next | `env/development.example` → `.env.development.local` |
| Wrangler preview | `env/wrangler.development.example` → `.dev.vars` |
| 正式 | GitHub Secrets／Variables + Worker Secrets（見 `env/production.example`） |

細節：[env/README.md](../env/README.md)、[DEPLOY.md](DEPLOY.md)。

### 能力邊界

- Web App：無本機 `.torrent` 上傳；分頁為 **下載**／**RSS**；無內嵌網頁瀏覽
- RSS：代理 qB `/api/v2/rss/*`；自動下載規則尚未實作
- Bot：可收檔；`allowed_updates` 僅 `message`；Reply Keyboard 每次回覆附上
