# AGENTS.md — AI / Cursor 開發指引

給在此 repo 工作的 AI agent 與人類開發者。細節文件見 [`docs/`](docs/)。

## 專案本質

個人用 **Telegram Mini App + Bot**，經 **Cloudflare Workers（OpenNext / Next.js App Router）** 代理 **qBittorrent Web API**。

- Worker 名稱：`tg-dl`（`wrangler.jsonc`）
- 預設公開 URL：`https://tg-dl.<subdomain>.workers.dev`
- 語言／UI：繁體中文（`zh-Hant`）
- **不要**做成多租戶 SaaS；白名單制個人工具即可

## 絕對不要搞混的兩個 URL

| 變數 | 是什麼 | Worker runtime 讀取？ |
|------|--------|----------------------|
| `APP_URL` | 這個 Mini App 的 Workers URL | **否**（僅 GitHub Actions） |
| `QBITTORRENT_URL` | qBittorrent Web UI | **是** |

把 qB 網址填進 `APP_URL` 會弄壞 webhook、Menu Button、完成通知。

## 程式碼邊界

| 目錄／檔案 | 職責 |
|------------|------|
| `components/` | 僅 Mini App UI（client） |
| `app/api/qb/*` | Mini App API；`Authorization: tma <initData>` |
| `app/api/telegram/webhook` | Bot；`X-Telegram-Bot-Api-Secret-Token` = `CRON_SECRET` |
| `app/api/cron/completions` | 通知；`Authorization: Bearer CRON_SECRET` |
| `lib/qbittorrent.ts` | 唯一直接打 qBittorrent 的模組 |
| `lib/telegram.ts` | Mini App initData 驗證 |
| `lib/telegram-bot.ts` | Bot API（發訊、下檔） |
| `lib/bot-handler.ts` | Bot 指令與訊息路由 |
| `lib/completions.ts` | 開始／完成通知 + tags |
| `lib/client-api.ts` | 瀏覽器端打 `/api/qb/*` |
| `lib/env.ts` | 共用 env／白名單解析 |

## 認證規則（改 API 前必讀）

1. `/api/qb/*` → `requireAuth` → HMAC 驗證 initData + `ALLOWED_TELEGRAM_USER_IDS`
2. Webhook secret 與 cron Bearer **共用** `CRON_SECRET`（刻意設計，勿擅自拆成兩個除非文件與 Deploy 同步改）
3. Bot 與通知的 chat 對象 = 同一白名單

## qBittorrent 實作注意

- 請求需正確 `Origin`／`Referer`（見 `lib/qbittorrent.ts` CSRF 處理）
- Login 勿亂加 Basic Auth（會影響 SID）
- Pause/Resume：先 v5 `stop`/`start`，再 fallback v4 `pause`/`resume`
- 通知去重靠 torrent tags：`tg-started`、`tg-notified`（15 分鐘視窗）

## 功能落點

- Mini App：**不能**上傳 `.torrent` 檔；只加 URL／magnet
- `.torrent` 檔：只走 Bot
- Reply Keyboard：每次 Bot 回覆都附上
- Menu Button「開啟 App」：Deploy workflow 的 `setChatMenuButton`

## Deploy / CI 約束

- Secrets／Variables 對照見 [`docs/DEPLOY.md`](docs/DEPLOY.md)
- **不要**用 `GITHUB_TOKEN` 去 `gh variable set APP_URL`（常 403）
- Deploy 會 `wrangler secret bulk` 同步 runtime secrets；`APP_URL` **不**進 Worker
- 改通知邏輯後，確認 `notify-completions.yml` 仍打 `POST /api/cron/completions`

## 變更風格

- 回覆使用者用**繁體中文**
- 只改任務相關檔案；不順手大重構
- 不擅自 commit／push，除非使用者要求
- 不提交 `.env`、`.dev.vars`、真實 secrets
- 新增功能先對齊現有分層（client-api ↔ route ↔ qbittorrent），勿在 component 直打 qB

## 建議閱讀順序

1. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
2. [`docs/DEPLOY.md`](docs/DEPLOY.md)
3. [`docs/USER.md`](docs/USER.md)
4. [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
5. `lib/qbittorrent.ts`、`lib/bot-handler.ts`、`lib/completions.ts`
