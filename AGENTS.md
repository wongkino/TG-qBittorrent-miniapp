# AGENTS.md — AI / Cursor 開發指引

給在此 repo 工作的 AI agent 與人類開發者。文件索引見 [`docs/README.md`](docs/README.md)。

## 專案本質

個人用 **qBittorrent Web App**（Google 登入、PWA），經 **Cloudflare Workers（OpenNext / Next.js App Router）** 代理 **qBittorrent Web API**。

- Worker 名稱：`tg-dl`（`wrangler.jsonc`；歷史命名，與 Telegram 無關）
- 預設 URL：`https://tg-dl.<subdomain>.workers.dev`
- 語系：英／繁中／簡中／日；存 `localStorage`（`lib/i18n.ts`）
- 白名單制個人工具；**不要**做成多租戶 SaaS

## 分層與邊界

```
components/*  →  lib/client-api.ts  →  app/api/qb/*  →  lib/qbittorrent.ts  →  qB
     ↑                    ↑                  ↑
  lib/i18n.ts      lib/client-auth.ts   lib/auth.ts
  lib/theme.ts     lib/google-session   lib/google-auth.ts
```

| 層 | 目錄／檔案 | 規則 |
|----|------------|------|
| UI | `components/` | Client only；字串走 `lib/i18n.ts` |
| 前端 API | `lib/client-api.ts`、`lib/client-auth.ts` | 只打 `/api/qb/*` |
| API Route | `app/api/qb/*/route.ts` | `requireAuth`；preview 用 `previewResponse` |
| qB 代理 | `lib/qbittorrent.ts` | **唯一**直接打 qBittorrent |
| 認證 | `lib/auth.ts`、`lib/google-auth.ts` | Server JWT 驗證 |
| 開發 | `lib/dev/preview.ts` | 僅 `NODE_ENV=development` |

完整目錄見 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)。

## 認證

1. `/api/qb/*` → `Authorization: Bearer <Google ID token>` + `ALLOWED_GOOGLE_EMAILS`
2. 本機預覽 → `Bearer dev-preview`（`DEV_PREVIEW=1` + `NEXT_PUBLIC_DEV_PREVIEW=1`）

## qBittorrent 注意

- 正確 `Origin`／`Referer`（CSRF）
- Login 勿亂加 Basic Auth
- Pause/Resume：先 `stop`/`start`，再 fallback `pause`/`resume`

## 功能範圍

- 分頁：**下載**、**RSS**
- 語系／主題：App 內切換，localStorage
- 不加 `.torrent` 上傳、無內嵌瀏覽代理

## Deploy

- Secrets／Variables：[`docs/DEPLOY.md`](docs/DEPLOY.md)、`env/production.example`
- `npm run deploy` → `wrangler secret bulk`

## 變更風格

- 回覆使用者用**繁體中文**
- 只改任務相關檔案；不順手大重構
- 不提交 `.env*`、`.dev.vars`、真實 secrets
- 新功能：`qbittorrent` → route → `client-api` → component + `i18n`（四語）

## 建議閱讀

1. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
2. [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
3. [`env/README.md`](env/README.md)
4. `lib/qbittorrent.ts`、`components/QbDashboard.tsx`
