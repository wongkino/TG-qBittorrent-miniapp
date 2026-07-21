# 架構說明

個人 qBittorrent **Web App**（Google 登入、PWA／iOS 主畫面），經 Cloudflare Workers 代理 qBittorrent Web API。

---

## 分層總覽

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation（瀏覽器）                                      │
│  app/page.tsx → components/WebApp → components/QbDashboard  │
│  lib/client-api.ts · lib/client-auth.ts · lib/google-session  │
└────────────────────────────┬────────────────────────────────┘
                             │ Authorization: Bearer <Google ID token>
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  API（Next.js Route Handlers）                               │
│  app/api/qb/*/route.ts · lib/api.ts · lib/auth.ts             │
└────────────────────────────┬────────────────────────────────┘
                             │ Session + CSRF
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  qBittorrent 代理                                            │
│  lib/qbittorrent.ts → QBITTORRENT_URL                        │
└─────────────────────────────────────────────────────────────┘

Deploy：GitHub Actions → OpenNext build → wrangler deploy（worker.ts）
```

技術棧：Next.js 16 App Router、React 19、TypeScript、`@opennextjs/cloudflare`、Wrangler、Google Identity Services、`jose`。

---

## 目錄結構

```
tg-dl/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 根路由，掛載 <WebApp />
│   ├── layout.tsx                # PWA meta、主題 boot script、globals.css
│   ├── globals.css               # UI 樣式（含 data-theme 日間／夜間）
│   └── api/qb/                   # 後端 API（皆需 Google 登入或 DEV_PREVIEW）
│       ├── snapshot/route.ts     # GET  torrents + categories（開機／重整）
│       ├── torrents/route.ts     # GET  種子列表（輪詢）
│       ├── add/route.ts          # POST magnet／URL
│       ├── pause/route.ts        # POST 暫停
│       ├── resume/route.ts       # POST 繼續
│       ├── delete/route.ts       # POST 移除／刪檔
│       ├── category/route.ts     # POST 改分類
│       └── rss/                  # RSS 代理
│           ├── route.ts          # GET  訂閱列表
│           ├── add/route.ts
│           ├── remove/route.ts
│           ├── refresh/route.ts
│           └── read/route.ts
│
├── components/                   # React client 元件
│   ├── WebApp.tsx                # 登入流程 + 掛載主畫面
│   ├── GoogleSignIn.tsx          # Google Identity Services 按鈕
│   ├── QbDashboard.tsx           # 下載／RSS 分頁、輪詢、批次
│   ├── TorrentList.tsx           # 種子列表容器
│   ├── TorrentRow.tsx            # 單筆種子列
│   ├── AddTorrentForm.tsx        # 加 magnet／URL
│   ├── RssPanel.tsx              # RSS 訂閱與文章
│   ├── ListToolbar.tsx           # 排序、篩選、批次工具列
│   ├── CategorySelect.tsx        # 分類下拉
│   ├── I18nProvider.tsx          # 語系 context（localStorage）
│   ├── LanguageToggle.tsx        # EN／繁／简／日
│   ├── ThemeToggle.tsx           # 日間／夜間
│   └── icons.tsx                 # 共用 SVG
│
├── lib/
│   ├── auth.ts                   # requireAuth、VerifiedAuth、AuthError
│   ├── google-auth.ts            # Google JWT 驗證（jose + 白名單 email）
│   ├── google-session.ts         # 瀏覽器 credential 存取、standalone 偵測
│   ├── google-client-id.ts       # 前端讀 GOOGLE_CLIENT_ID
│   ├── client-api.ts             # fetch 封裝 → /api/qb/*
│   ├── client-auth.ts            # Bearer header、AuthSessionError
│   ├── api.ts                    # Route 共用：jsonOk、previewResponse、handleApiError
│   ├── qbittorrent.ts            # 唯一直接打 qB 的模組（CSRF、session）
│   ├── env.ts                    # process.env 讀取、email 白名單解析
│   ├── i18n.ts                   # 四語字串、translate、locale 持久化
│   ├── theme.ts                  # data-theme、localStorage
│   ├── types.ts                  # Torrent 等型別
│   ├── format.ts                 # 排序篩選、進度／速度顯示
│   └── dev/
│       └── preview.ts            # DEV_PREVIEW 假資料（僅 development）
│
├── types/
│   └── google-gis.d.ts           # Google Identity Services 型別
│
├── public/
│   ├── manifest.webmanifest      # PWA
│   ├── icon.svg
│   └── _headers                  # 靜態資源 cache
│
├── env/                          # 環境變數範本（見 env/README.md）
├── docs/                         # 文件（見 docs/README.md）
├── worker.ts                     # Cloudflare 入口（OpenNext + DO exports）
├── wrangler.jsonc                # Worker 名稱 tg-dl
├── next.config.ts                # GOOGLE_CLIENT_ID → NEXT_PUBLIC_*
└── open-next.config.ts           # OpenNext Cloudflare 設定
```

### 元件分組（邏輯）

| 分組 | 檔案 | 職責 |
|------|------|------|
| **App 殼層** | `WebApp`、`GoogleSignIn` | 登入、session 恢復、過期重登 |
| **App 殼層** | `I18nProvider`、`LanguageToggle`、`ThemeToggle` | 語系與主題（localStorage） |
| **下載** | `QbDashboard`、`TorrentList`、`TorrentRow`、`ListToolbar`、`AddTorrentForm`、`CategorySelect` | 列表、排序、篩選、批次、加種 |
| **RSS** | `RssPanel` | 訂閱管理、文章加入下載 |

### lib 分組（邏輯）

| 分組 | 檔案 | 執行環境 |
|------|------|----------|
| **認證** | `auth`、`google-auth`、`google-session`、`google-client-id` | Server + Client |
| **前端 API** | `client-api`、`client-auth` | Client only |
| **Route 共用** | `api`、`env` | Server only |
| **qB 代理** | `qbittorrent` | Server only |
| **UI 共用** | `i18n`、`theme`、`types`、`format` | Mostly client |
| **開發** | `dev/preview` | Server（dev only） |

---

## 請求流

### 登入

1. `WebApp` 讀 `localStorage` 內 Google credential，或顯示 `GoogleSignIn`
2. `fetchSnapshot` 驗證 token；401 → 清除 credential、回到登入
3. 成功後掛載 `QbDashboard`

### 下載操作

`QbDashboard` → `client-api` → `/api/qb/*` → `requireAuth` → `qbittorrent` → qBittorrent

| client-api | Route | qBittorrent |
|------------|-------|-------------|
| `fetchSnapshot` | `GET /api/qb/snapshot` | torrents + categories |
| `fetchTorrents` | `GET /api/qb/torrents` | `/api/v2/torrents/info` |
| `addTorrentUrl` | `POST /api/qb/add` | `/api/v2/torrents/add` |
| `pauseTorrent` | `POST /api/qb/pause` | `stop` → `pause` |
| `resumeTorrent` | `POST /api/qb/resume` | `start` → `resume` |
| `deleteTorrent` | `POST /api/qb/delete` | `/api/v2/torrents/delete` |
| `setTorrentCategory` | `POST /api/qb/category` | `setCategory` |
| `fetchRssFeeds` 等 | `/api/qb/rss/*` | `/api/v2/rss/*` |

- 多 hash 以 `|` 串接
- 下載分頁約每 4 秒輪詢（`document.visibilityState === 'hidden'` 時跳過）
- 開機、手動重整、加種後用 `snapshot`（含 categories）

---

## 認證

| 情境 | 機制 |
|------|------|
| 正式 | `Authorization: Bearer <Google ID token>`；`jose` 驗證；`ALLOWED_GOOGLE_EMAILS` |
| 本機預覽 | `Bearer dev-preview`；需 `DEV_PREVIEW=1` + `NEXT_PUBLIC_DEV_PREVIEW=1` + `NODE_ENV=development` |

Token 約 1 小時過期；`client-api` 對 401 拋 `AuthSessionError`，`WebApp` 清除 credential 並回到登入。

---

## 本機狀態持久化

| 資料 | 儲存 | 模組 |
|------|------|------|
| Google credential | `localStorage` | `google-session.ts` |
| 語系 | `localStorage` | `i18n.ts`（`LOCALE_STORAGE_KEY`） |
| 主題 | `localStorage` | `theme.ts`（`THEME_STORAGE_KEY`） |

無伺服器端 session；Worker 每次請求獨立驗證 JWT。

---

## qBittorrent 連線

- `Origin`／`Referer` 須符合 qB CSRF 要求（見 `qbittorrent.ts`）
- Form login 不帶 Basic Auth；之後請求帶 SID
- Process 內 session 快取約 55 分鐘
- Pause／Resume：先 v5 `stop`／`start`，失敗再 fallback v4 `pause`／`resume`

---

## 環境變數

| 變數 | 用途 |
|------|------|
| `GOOGLE_CLIENT_ID` | OAuth（建置時映射為 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`） |
| `ALLOWED_GOOGLE_EMAILS` | 逗號分隔 email 白名單 |
| `QBITTORRENT_URL` | qB Web UI 根網址 |
| `QBITTORRENT_USERNAME` / `PASSWORD` | qB 登入 |
| `DEV_PREVIEW` / `NEXT_PUBLIC_DEV_PREVIEW` | 本機假資料（僅 dev） |

擺放位置見 [env/README.md](../env/README.md)、[DEPLOY.md](DEPLOY.md)。

---

## 能力邊界

- 分頁：**下載**、**RSS**
- 語系：英／繁中／簡中／日
- 可加 magnet／torrent URL；**不能**上傳本機 `.torrent`
- 無內嵌網頁瀏覽、無 Telegram Bot、無下載通知

---

## 擴充新功能

1. `lib/qbittorrent.ts` — qB API 封裝  
2. `app/api/qb/<name>/route.ts` — `requireAuth` + `previewResponse`  
3. `lib/client-api.ts` — 瀏覽器 client  
4. `components/*` + `lib/i18n.ts`（四語）

詳見 [DEVELOPMENT.md](DEVELOPMENT.md)。
