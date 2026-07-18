# Telegram Mini App → qBittorrent

個人專用的 Telegram Mini App，透過後端代理安全連接你的 qBittorrent Web UI（公網 HTTPS）。

- 前端只在 Telegram 內運作，憑證不會暴露給瀏覽器
- 每個 API 請求都會驗證 Telegram `initData` 簽名
- 僅白名單內的 Telegram User ID 可使用
- 透過 **GitHub Actions** 部署到 **Cloudflare Workers**（OpenNext）

## 架構

```
Telegram Mini App → Next.js API (Cloudflare Workers) → qBittorrent Web API
                              ↑
                    驗證 initData + 白名單
```

## 準備

1. **Telegram Bot**
   - 開啟 [@BotFather](https://t.me/BotFather)
   - `/newbot` 建立 Bot，取得 **Bot Token**
   - `/newapp`（或 Bot Settings → Configure Mini App）設定 Mini App，URL 先填部署後的 HTTPS 網址

2. **你的 Telegram User ID**
   - 可用 [@userinfobot](https://t.me/userinfobot) 查詢 numeric ID

3. **qBittorrent**
   - Web UI 已有公網 HTTPS（例如反向代理）
   - 準備 Web UI 帳號與密碼

4. **Cloudflare 帳號** + GitHub repo

## 本機開發

```bash
cp .env.example .env.local
# 編輯 .env.local 填入變數

npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。  
注意：在一般瀏覽器沒有 Telegram `initData`，會顯示未授權；請用 Telegram 開啟正式部署的 Mini App 測試。

若要在本機用 Workers runtime 預覽：

```bash
cp .dev.vars.example .dev.vars
# 編輯 .dev.vars
npm run preview
```

### 環境變數

| 變數 | 說明 |
|------|------|
| `TELEGRAM_BOT_TOKEN` | BotFather 給的 Bot Token |
| `ALLOWED_TELEGRAM_USER_IDS` | 允許的 User ID，多個用逗號分隔 |
| `QBITTORRENT_URL` | qBittorrent 公網基底 URL，例如 `https://qb.example.com`（不要結尾 `/`） |
| `QBITTORRENT_USERNAME` | Web UI 使用者名稱 |
| `QBITTORRENT_PASSWORD` | Web UI 密碼 |

## 部署到 Cloudflare（GitHub Actions）

### 1. Cloudflare API Token

在 Cloudflare Dashboard → **My Profile** → **API Tokens** 建立 Token，建議權限：

- Account → Workers Scripts → Edit
- Account → Account Settings → Read（若需要）

並記下 **Account ID**（Workers 概覽頁右側）。

### 2. GitHub Actions Secrets & Variables

在 repo → **Settings** → **Secrets and variables** → **Actions** 設定：

**Secrets**

| Secret | 說明 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `TELEGRAM_BOT_TOKEN` | BotFather Bot Token |
| `QBITTORRENT_USERNAME` | Web UI 使用者名稱 |
| `QBITTORRENT_PASSWORD` | Web UI 密碼 |

**Variables**

| Variable | 說明 |
|----------|------|
| `ALLOWED_TELEGRAM_USER_IDS` | 允許的 User ID，多個用逗號分隔 |
| `QBITTORRENT_URL` | qBittorrent 公網基底 URL，例如 `https://qb.example.com` |

部署時 Workflow 會把這些值同步到 Cloudflare Worker secrets，不必本機執行 `wrangler secret put`。

### 3. 推送到 main / master

```bash
git push origin main
```

Workflow [`.github/workflows/deploy-cloudflare.yml`](.github/workflows/deploy-cloudflare.yml) 會自動建置、部署，並同步 secrets。也可在 Actions 頁手動 **Run workflow**。

部署成功後會得到類似：

`https://tg-qbittorrent-miniapp.<你的子網域>.workers.dev`

把此 URL 設進 BotFather Mini App，再到 Telegram 開啟即可。

### 本機手動部署（可選）

本機部署仍可用 `.dev.vars` / `.env.local`；正式環境請靠 GitHub Actions 同步 secrets：

```bash
npm run deploy
```

## 功能

- 種子列表（進度、狀態、上下載速度、ETA）
- 暫停 / 繼續
- 移除（保留檔案）或刪除（含檔案）
- 貼上 magnet 或 `.torrent` URL 新增
- 約每 4 秒自動重新整理

## API 一覽

| Method | Path | 說明 |
|--------|------|------|
| GET | `/api/auth/me` | 驗證身分 |
| GET | `/api/qb/torrents` | 列出種子 |
| POST | `/api/qb/pause` | `{ "hashes": "..." }` |
| POST | `/api/qb/resume` | `{ "hashes": "..." }` |
| POST | `/api/qb/delete` | `{ "hashes": "...", "deleteFiles": true }` |
| POST | `/api/qb/add` | `{ "urls": "magnet:..." }` |

所有請求需帶：

```
Authorization: tma <Telegram initData>
```

## 安全注意

- 不要把 `.env.local`、`.dev.vars` 或 Bot Token / qBittorrent 密碼提交到 git
- 務必設定 `ALLOWED_TELEGRAM_USER_IDS`，否則會拒絕所有請求
- qBittorrent 建議維持 HTTPS，並使用強密碼
