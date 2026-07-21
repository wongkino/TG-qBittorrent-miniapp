# 架構說明

## 總覽

```
┌─────────────────────┐
│      Web App        │
│  下載 / RSS         │
│  (Google OAuth)     │
└─────────┬───────────┘
          │ Bearer Google ID token
          ▼
┌─────────────────────────────────────────────────┐
│     Cloudflare Worker `tg-dl` (Next.js)         │
│  worker.ts = OpenNext fetch                     │
│  /api/qb/*                                      │
└───────────────────────┬─────────────────────────┘
                        │ Web API + CSRF headers
                        ▼
              ┌───────────────────┐
              │   qBittorrent     │
              │  QBITTORRENT_URL  │
              └───────────────────┘

GitHub Actions ──deploy──► Worker + secrets
```

技術棧：Next.js App Router、React、TypeScript、`@opennextjs/cloudflare`、Wrangler、Google Identity Services、`jose`（JWT 驗證）。

入口：`worker.ts`（包裝 `.open-next/worker.js`）。

---

## 目錄結構

```
worker.ts                     # Cloudflare 入口
wrangler.jsonc
env/                          # dev／prod 環境變數範本（見 env/README.md）
app/
  page.tsx                    # 掛載 WebApp
  layout.tsx                  # viewport、PWA meta、主題 boot script
  globals.css
  api/qb/*/route.ts           # Web App 後端代理（含 snapshot、rss）
components/
  WebApp.tsx                  # Google 登入 + 掛載 QbDashboard
  GoogleSignIn.tsx
  QbDashboard.tsx             # 分頁：下載／RSS
lib/
  qbittorrent.ts              # 唯一直接打 qB 的模組
  auth.ts / google-auth.ts
  google-session.ts
  client-api.ts
  api.ts / env.ts / i18n.ts / theme.ts
  dev/preview.ts
public/
  manifest.webmanifest
  icon.svg
docs/
.github/workflows/
```

**已移除：** Telegram Bot、通知 cron、Mini App、`@twa-dev/sdk`、內嵌瀏覽代理。

---

## 請求流

`components/WebApp.tsx` → `components/QbDashboard.tsx` → `lib/client-api.ts` → `app/api/qb/*` → `lib/qbittorrent.ts` → qBittorrent

| Client | Route | qBittorrent |
|--------|-------|------------|
| `fetchSnapshot` | `GET /api/qb/snapshot` | torrents + categories |
| `fetchTorrents` | `GET /api/qb/torrents` | `GET /api/v2/torrents/info` |
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

語系：App 內手動切換（`LanguageToggle`，存 `localStorage`）。見 `lib/i18n.ts`。

主題：`data-theme=light|dark`（`lib/theme.ts`），預設夜間，可切換並存 localStorage。

---

## 認證模型

| 介面 | 機制 |
|------|------|
| `/api/qb/*` | `Authorization: Bearer <Google ID token>`；JWT 驗證；`ALLOWED_GOOGLE_EMAILS` 白名單 |
| 本機 `DEV_PREVIEW` | `Bearer dev-preview`（僅 `NODE_ENV=development`） |

---

## 核心模組

| 模組 | 職責 |
|------|------|
| `worker.ts` | Cloudflare 入口 |
| `lib/env.ts` | env 讀取、白名單解析 |
| `lib/auth.ts` / `lib/google-auth.ts` | Google ID token 驗證（含 preview） |
| `lib/google-session.ts` | 瀏覽器 credential 存取、standalone 偵測 |
| `lib/qbittorrent.ts` | Session、CSRF、CRUD、RSS |
| `lib/client-api.ts` | 前端 API client |
| `lib/api.ts` | Route 共用 auth／preview／錯誤／hashes |
| `lib/i18n.ts` | 多語字串 |
| `lib/theme.ts` | 日間／夜間 |
| `lib/dev/preview.ts` | 本機預覽假資料 |
| `lib/types.ts` / `format.ts` | 型別、排序、顯示格式 |

---

## 重要實作細節

### qBittorrent CSRF／登入

- 嚴格 `Origin`／`Referer`；預設埠會剝除
- Form login 不帶 Basic Auth；之後可帶 SID + Basic
- Process 內 session 快取約 55 分鐘

### 環境變數擺放

| 環境 | 位置 |
|------|------|
| 本機 Next | `env/development.example` → `.env.development.local` |
| Wrangler preview | `env/wrangler.development.example` → `.dev.vars` |
| 正式 | GitHub Secrets／Variables + Worker Secrets（見 `env/production.example`） |

細節：[env/README.md](../env/README.md)、[DEPLOY.md](DEPLOY.md)。

### 能力邊界

- Web App：分頁為 **下載**／**RSS**；無內嵌網頁瀏覽
- RSS：代理 qB `/api/v2/rss/*`；自動下載規則尚未實作
