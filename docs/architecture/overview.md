# 架構總覽

個人 qBittorrent **Web App**（Google 登入、PWA／iOS 主畫面），經 Cloudflare Workers 代理 qBittorrent Web API。

檔案目錄見 [codebase.md](codebase.md)。API 對照見 [reference/api-routes.md](../reference/api-routes.md)。

---

## 分層

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

**技術棧**：Next.js 16 App Router、React 19、TypeScript、`@opennextjs/cloudflare`、Wrangler、Google Identity Services、`jose`。

---

## 請求流

### 登入

1. `WebApp` 讀 `localStorage` Google credential，或顯示 `GoogleSignIn`
2. `fetchSnapshot` 驗證 token；401 → 清除 credential、回到登入
3. 成功後掛載 `QbDashboard`

### 資料操作

`QbDashboard` → `client-api` → `/api/qb/*` → `requireAuth` → `qbittorrent` → qBittorrent

- 多 hash 以 `|` 串接
- 下載分頁約每 4 秒輪詢（頁面隱藏時跳過）
- 開機／手動重整／加種用 `snapshot`（含 categories）

---

## 認證

| 情境 | 機制 |
|------|------|
| 正式 | `Authorization: Bearer <Google ID token>`；`jose` 驗證；`ALLOWED_GOOGLE_EMAILS` |
| 本機預覽 | `Bearer dev-preview`；`DEV_PREVIEW=1` + `NEXT_PUBLIC_DEV_PREVIEW=1` + `NODE_ENV=development` |

Token 約 1 小時過期 → `AuthSessionError`（401）→ `WebApp` 清除 credential 重登。

---

## 本機狀態（無伺服器 session）

| 資料 | 儲存 | 模組 |
|------|------|------|
| Google credential | `localStorage` | `lib/google-session.ts` |
| 語系 | `localStorage` | `lib/i18n.ts` |
| 主題 | `localStorage` | `lib/theme.ts` |

---

## qBittorrent 連線

- `Origin`／`Referer` 須符合 CSRF（`lib/qbittorrent.ts`）
- Form login 不帶 Basic Auth；之後帶 SID
- Session 快取約 55 分鐘
- Pause/Resume：先 `stop`/`start`，再 fallback `pause`/`resume`

---

## 能力邊界

| 有 | 無 |
|----|-----|
| 下載列表、排序、批次、magnet/URL | 本機 `.torrent` 上傳 |
| RSS 訂閱管理 | 內嵌網頁瀏覽 |
| 四語、日間／夜間、PWA／主畫面 | 多租戶 SaaS |

---

## 擴充入口

見 [guides/development.md](../guides/development.md) 與 [ai/tasks.md](../ai/tasks.md)。
