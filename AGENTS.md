# AGENTS.md — AI / Cursor 開發指引

給在此 repo 工作的 AI agent 與人類開發者。文件索引見 [`docs/README.md`](docs/README.md)。

## 專案本質

個人用 **Telegram Mini App + Bot**，經 **Cloudflare Workers（OpenNext / Next.js App Router）** 代理 **qBittorrent Web API**。

- Worker 名稱：`tg-dl`（`wrangler.jsonc`）
- 預設公開 URL：`https://tg-dl.<subdomain>.workers.dev`
- Mini App UI：繁中／簡中／英文（跟 Telegram `language_code`，見 `lib/i18n.ts`）
- Bot 文案：目前繁中為主
- **不要**做成多租戶 SaaS；白名單制個人工具即可

## 絕對不要搞混的兩個 URL

| 變數 | 是什麼 | Worker runtime 讀取？ |
|------|--------|----------------------|
| `APP_URL` | 這個 Mini App 的 Workers URL | **否**（僅 GitHub Actions） |
| `QBITTORRENT_URL` | qBittorrent Web UI | **是** |

把 qB 網址填進 `APP_URL` 會弄壞 webhook、Menu Button。

## 程式碼邊界

| 目錄／檔案 | 職責 |
|------------|------|
| `components/` | 僅 Mini App UI（client） |
| `app/api/qb/*` | Mini App API；`Authorization: tma <initData>` |
| `app/api/qb/rss*` | RSS（代理 qB `/api/v2/rss/*`） |
| `app/api/telegram/webhook` | Bot；`X-Telegram-Bot-Api-Secret-Token` = `CRON_SECRET` |
| `app/api/cron/completions` | 通知；`Authorization: Bearer CRON_SECRET` |
| `worker.ts` | OpenNext `fetch` + `scheduled` cron |
| `lib/qbittorrent.ts` | **唯一**直接打 qBittorrent 的模組 |
| `lib/telegram.ts` | initData 驗證（含 `DEV_PREVIEW`） |
| `lib/telegram-bot.ts` | Bot API |
| `lib/bot-handler.ts` | Bot 指令與訊息 |
| `lib/completions.ts` | 開始／完成通知 + tags |
| `lib/client-api.ts` | 瀏覽器端打 `/api/qb/*` |
| `lib/i18n.ts` | Mini App 三語 |
| `lib/theme.ts` | 日間／夜間 |
| `lib/dev/preview.ts` | 本機預覽假資料（僅 development） |
| `env/` | 環境變數範本（見 `env/README.md`） |

**不要**再加內嵌瀏覽代理；已移除。

## 認證規則（改 API 前必讀）

1. `/api/qb/*` → `requireAuth` → HMAC 驗證 initData + `ALLOWED_TELEGRAM_USER_IDS`
2. Webhook secret 與 cron Bearer **共用** `CRON_SECRET`
3. Bot 與通知的 chat 對象 = 同一白名單
4. `DEV_PREVIEW` 僅 development，且需 `DEV_PREVIEW=1` + `NEXT_PUBLIC_DEV_PREVIEW=1`

## qBittorrent 實作注意

- 請求需正確 `Origin`／`Referer`（見 `lib/qbittorrent.ts` CSRF）
- Login 勿亂加 Basic Auth（會影響 SID）
- Pause/Resume：先 v5 `stop`/`start`，再 fallback v4 `pause`/`resume`
- 通知去重 tags：`tg-started`、`tg-notified`（15 分鐘視窗）

## 功能落點

- Mini App 分頁：**下載**／**RSS**；不能上傳本機 `.torrent`
- `.torrent` 檔：只走 Bot
- 語系：自動跟 Telegram；主題：App 內切換
- Reply Keyboard：每次 Bot 回覆都附上
- Menu Button：Deploy workflow 的 `setChatMenuButton`

## Deploy / CI 約束

- Secrets／Variables：[`docs/DEPLOY.md`](docs/DEPLOY.md)、`env/production.example`
- **不要**用 `GITHUB_TOKEN` 去 `gh variable set APP_URL`
- Deploy 會 `wrangler secret bulk`；`APP_URL` **不**進 Worker
- 改通知後確認 `worker.ts` `scheduled` 與 `/api/cron/completions` 一致

## 變更風格

- 回覆使用者用**繁體中文**
- 只改任務相關檔案；不順手大重構
- 不擅自 commit／push，除非使用者要求
- 不提交 `.env*`、`.dev.vars`、真實 secrets；範本只放 `env/*.example`
- 新增功能對齊分層（client-api ↔ route ↔ qbittorrent）；UI 字串走 `lib/i18n.ts`

## 建議閱讀順序

1. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
2. [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)
3. [`env/README.md`](env/README.md)
4. [`docs/DEPLOY.md`](docs/DEPLOY.md)
5. `lib/qbittorrent.ts`、`lib/bot-handler.ts`、`lib/completions.ts`、`lib/i18n.ts`
