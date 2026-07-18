# Telegram Mini App → qBittorrent

個人專用 Telegram Bot + Mini App，經 **Cloudflare Workers**（OpenNext）代理連接你的 **qBittorrent Web UI**。

- Worker 名稱：`tg-dl`
- 預設網址：`https://tg-dl.<你的子網域>.workers.dev`
- 認證：Telegram Mini App `initData` HMAC + `ALLOWED_TELEGRAM_USER_IDS` 白名單

---

## 功能一覽

### Mini App
- 種子列表（進度、上下載速度、ETA、狀態）
- 排序：加入時間、名稱、進度、速度、大小、ETA
- 單筆／批次：暫停、繼續、移除、刪除檔案
- 新增 magnet／torrent URL（含剪貼簿貼上）
- 分類選擇（新增與既有種子）

### Bot
- 輸入框左側 **開啟 App**（Menu Button → Mini App）
- Reply Keyboard：狀態／列表／說明（每次回覆都會附上）
- 接收 magnet、torrent URL、`.torrent` 檔

### 通知
- 下載開始（tag：`tg-started`）
- 下載完成（tag：`tg-notified`）
- 由 GitHub Actions 每 2 分鐘呼叫 `/api/cron/completions`

---

## 前置需求

1. 公開可連的 qBittorrent Web UI（建議 HTTPS，例如 `https://dl.example.com`）
2. [@BotFather](https://t.me/BotFather) 建立 Bot，取得 token
3. Cloudflare 帳號（Workers）
4. GitHub repo（用於 Actions 部署與通知 cron）

取得自己的 Telegram User ID（填白名單用），可用 [@userinfobot](https://t.me/userinfobot) 等。

---

## 本機開發

```bash
cp .env.example .env.local
# 若要用 wrangler preview，另存：
cp .dev.vars.example .dev.vars

npm install
npm run dev
```

| 指令 | 說明 |
|------|------|
| `npm run dev` | Next.js 本機開發（讀 `.env.local`） |
| `npm run build` / `start` | 本機正式建置 |
| `npm run preview` | OpenNext 建置後以 Wrangler 預覽（讀 `.dev.vars`） |
| `npm run deploy` | 建置並部署到 Cloudflare Workers |
| `npm run lint` | ESLint |

本機開啟 Mini App 需透過 Telegram（或能注入 `initData` 的環境）；純瀏覽器開通常會因缺少 Telegram 驗證而無法呼叫 API。

---

## 環境變數總表

依**用途**分四類，不要搞混：

| 變數 | 本機 `.env.local` | Wrangler `.dev.vars` | Cloudflare Worker Secret | GitHub Secret | GitHub Variable |
|------|:-----------------:|:--------------------:|:------------------------:|:-------------:|:---------------:|
| `TELEGRAM_BOT_TOKEN` | ✅ | ✅ | ✅（Deploy 同步） | ✅ | |
| `ALLOWED_TELEGRAM_USER_IDS` | ✅ | ✅ | ✅（Deploy 同步） | | ✅ |
| `QBITTORRENT_URL` | ✅ | ✅ | ✅（Deploy 同步） | | ✅ |
| `QBITTORRENT_USERNAME` | ✅ | ✅ | ✅（Deploy 同步） | ✅ | |
| `QBITTORRENT_PASSWORD` | ✅ | ✅ | ✅（Deploy 同步） | ✅ | |
| `CRON_SECRET` | ✅ | ✅ | ✅（Deploy 同步） | ✅ | |
| `APP_URL` | 僅文件範例 | ❌ | ❌ | | ✅ |
| `CLOUDFLARE_API_TOKEN` | | | | ✅ | |
| `CLOUDFLARE_ACCOUNT_ID` | | | | ✅ | |
| `NEXTJS_ENV` | | ✅（preview） | | | |

### 各變數說明

| 名稱 | 說明 |
|------|------|
| `TELEGRAM_BOT_TOKEN` | BotFather 發的 token；用於驗證 Mini App `initData`、Bot API、webhook |
| `ALLOWED_TELEGRAM_USER_IDS` | 允許使用的 Telegram User ID，逗號分隔，例如 `123456789` 或 `111,222` |
| `QBITTORRENT_URL` | qBittorrent Web UI 根網址，**不要**尾隨 `/`，例如 `https://dl.example.com` |
| `QBITTORRENT_USERNAME` / `PASSWORD` | Web UI 登入帳密 |
| `CRON_SECRET` | 自訂長隨機字串；保護 `/api/cron/completions`，並作為 Telegram webhook `secret_token` |
| `APP_URL` | **Mini App 的 Workers URL**（例如 `https://tg-dl.xxx.workers.dev`），**不是** qBittorrent URL。只給 GitHub Actions 設 webhook、Menu Button、完成通知用 |
| `CLOUDFLARE_API_TOKEN` | 需有 Workers 部署與讀 subdomain 等權限 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 帳號 ID |
| `NEXTJS_ENV` | Wrangler 本機 preview 用，通常 `development` |

範例檔：

- [`.env.example`](.env.example) — Next／文件（含 `APP_URL` 註解）
- [`.dev.vars.example`](.dev.vars.example) — Wrangler preview（**不含** `APP_URL`）

---

## BotFather 設定

1. `/newbot` 建立 Bot，複製 token → `TELEGRAM_BOT_TOKEN`
2. **Bot Settings → Configure Mini App**（可選）：綁定與 `APP_URL` 相同的 HTTPS 網址  
   Deploy 時也會用 `setChatMenuButton` 把輸入框左側設成「開啟 App」
3. 建議關閉隱私模式以外不需要的公開入口；本專案靠白名單限制使用者

Webhook 由 Deploy workflow 自動設定為：

`{APP_URL}/api/telegram/webhook`  
（`secret_token` = `CRON_SECRET`）

---

## GitHub Actions 設定

路徑：**Settings → Secrets and variables → Actions**

### Secrets
`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`TELEGRAM_BOT_TOKEN`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、`CRON_SECRET`

### Variables
`ALLOWED_TELEGRAM_USER_IDS`、`QBITTORRENT_URL`、`APP_URL`

### 建議初次上線順序

1. 先填除了 `APP_URL` 以外的 Secrets／Variables
2. Push 到 `main`（或手動跑 **Deploy to Cloudflare Workers**）
3. 到 Cloudflare Dashboard → Workers → `tg-dl` 複製網址
4. 設 GitHub Variable `APP_URL`（無尾隨 `/`）
5. 再跑一次 Deploy（才會正確 `setWebhook` + Menu Button）
6. 在 Telegram 打開 Bot，確認左側有「開啟 App」，並試 Reply Keyboard

### Workflows

| Workflow | 觸發 | 做什麼 |
|----------|------|--------|
| [deploy-cloudflare.yml](.github/workflows/deploy-cloudflare.yml) | push `main`／`master`，或手動 | 建置部署、同步 Worker secrets、設 webhook 與 Menu Button |
| [notify-completions.yml](.github/workflows/notify-completions.yml) | 每 2 分鐘／手動 | `POST {APP_URL}/api/cron/completions`（`Authorization: Bearer CRON_SECRET`） |

Deploy 會把這些寫入 Worker secrets：  
`TELEGRAM_BOT_TOKEN`、`ALLOWED_TELEGRAM_USER_IDS`、`QBITTORRENT_URL`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、`CRON_SECRET`  
（`APP_URL` **不會**寫入 Worker。）

---

## API 端點（簡述）

| 路徑 | 認證 | 說明 |
|------|------|------|
| `/api/qb/*` | `Authorization: tma <initData>` | Mini App 代理 qBittorrent |
| `/api/telegram/webhook` | Telegram `secret_token`（= `CRON_SECRET`） | Bot 更新 |
| `/api/cron/completions` | `Authorization: Bearer <CRON_SECRET>` | 開始／完成通知掃描 |

---

## 通知細節

[notify workflow](.github/workflows/notify-completions.yml) 每 2 分鐘檢查：

| 事件 | 條件 | Telegram 訊息 | qBittorrent tag |
|------|------|---------------|-----------------|
| 下載開始 | 近 15 分鐘內 `added_on`，尚未完成，且無相關 tag | ⬇️ 下載開始 | `tg-started` |
| 下載完成 | 近 15 分鐘內 `completion_on`，進度完成 | ✅ 下載完成 | `tg-notified` |

- 通知對象 = `ALLOWED_TELEGRAM_USER_IDS`
- 透過 Bot／Mini App 加入時，會先有「已加入」回覆；「下載開始」可能在 0–2 分鐘後再來一次（cron）
- 已完成才加入的種子不會發「開始」通知

---

## 架構簡述

```
Telegram Mini App / Bot
        │
        ▼
Cloudflare Worker (tg-dl, Next.js App Router)
        │  /api/qb/*  /api/telegram/webhook  /api/cron/completions
        ▼
qBittorrent Web API  (QBITTORRENT_URL)
```

GitHub Actions 另外負責：部署、同步 secrets、webhook／Menu Button、定時通知。

---

## 常見問題

**`APP_URL` 和 `QBITTORRENT_URL` 差在哪？**  
前者是這個 Mini App 的 Workers 網址；後者是你家裡／NAS 上的 qBittorrent。

**Deploy 成功但 Bot 沒反應？**  
確認 `APP_URL` 已設且重新 Deploy 過；Webhook 必須是 HTTPS 的 `{APP_URL}/api/telegram/webhook`。

**Mini App 顯示未授權？**  
檢查 `ALLOWED_TELEGRAM_USER_IDS` 是否包含你的 User ID（Deploy 後需已同步到 Worker）。

**qBittorrent 連不上？**  
確認 `QBITTORRENT_URL` 從公網可連、帳密正確，且 Web UI 允許此 Worker 來源（CSRF／反向代理設定）。

**開始／完成通知沒來？**  
確認 `APP_URL`、`CRON_SECRET`、notify workflow 有跑成功；種子需在 15 分鐘視窗內，且尚未打上對應 tag。

**為何不能用 `GITHUB_TOKEN` 自動寫入 `APP_URL` Variable？**  
預設 token 對 Actions Variables API 常會 403，因此改為手動設定 Variable。
