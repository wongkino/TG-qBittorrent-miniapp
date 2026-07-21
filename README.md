# qBittorrent Web App + Telegram Bot

個人專用 Web App（Google 登入）+ Telegram Bot，經 **Cloudflare Workers**（OpenNext）代理 **qBittorrent Web API**。

| | |
|--|--|
| Worker | `tg-dl` |
| 預設 URL | `https://tg-dl.<subdomain>.workers.dev` |
| Web App 認證 | Google OAuth + email 白名單 |
| 語系 | 英／繁中／簡中／日文（App 內切換；Bot／通知同步） |

---

## 文件

完整索引：[docs/README.md](docs/README.md)

| 文件 | 對象 |
|------|------|
| [docs/USER.md](docs/USER.md) | 使用者操作 |
| [docs/DEPLOY.md](docs/DEPLOY.md) | 部署與 Secrets |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 架構與模組 |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | 本機開發 |
| [env/README.md](env/README.md) | 環境變數範本 |
| [AGENTS.md](AGENTS.md) | AI／Cursor 約束 |

---

## 功能速覽

- **Web App**：Google 登入、下載列表、排序、批次、magnet／URL、分類、RSS、日間／夜間、四語
- **Bot**：狀態／列表／說明、magnet、`.torrent`、開啟 App
- **通知**：開始（`tg-started`）、完成（`tg-notified`）；Cloudflare Cron 每 5 分鐘

**不含**內嵌網頁瀏覽代理。

---

## 快速開始

### 本機（dev）

```bash
cp env/development.example .env.development.local
npm install
npm run dev
```

→ http://localhost:3000（預設 UI 預覽模式）

### 上線（prod）

1. 填 GitHub Secrets／Variables（[DEPLOY.md](docs/DEPLOY.md)、[`env/production.example`](env/production.example)）
2. Deploy → 複製 Workers URL → 設 `APP_URL` → **再 Deploy 一次**
3. Telegram 開啟 Bot 測試

---

## 環境變數總表

| 變數 | 本機 `.env.development.local` | Wrangler `.dev.vars` | Worker Secret | GitHub Secret | GitHub Variable |
|------|:-----------------------------:|:--------------------:|:-------------:|:-------------:|:---------------:|
| `TELEGRAM_BOT_TOKEN` | ✅ 可選 | ✅ | ✅ | ✅ | |
| `ALLOWED_TELEGRAM_USER_IDS` | ✅ 可選 | ✅ | ✅ | | ✅ |
| `QBITTORRENT_URL` | ✅ 可選 | ✅ | ✅ | | ✅ |
| `QBITTORRENT_USERNAME` | ✅ 可選 | ✅ | ✅ | ✅ | |
| `QBITTORRENT_PASSWORD` | ✅ 可選 | ✅ | ✅ | ✅ | |
| `CRON_SECRET` | ✅ 可選 | ✅ | ✅ | ✅ | |
| `GOOGLE_CLIENT_ID` | ✅ 可選 | ✅ | ✅ | | ✅ |
| `ALLOWED_GOOGLE_EMAILS` | ✅ 可選 | ✅ | ✅ | | ✅ |
| `DEV_PREVIEW` / `NEXT_PUBLIC_DEV_PREVIEW` | ✅ dev only | ❌ | ❌ | | |
| `APP_URL` | ❌ | ❌ | ❌ | | ✅ |
| `CLOUDFLARE_API_TOKEN` | | | | ✅ | |
| `CLOUDFLARE_ACCOUNT_ID` | | | | ✅ | |
| `NEXTJS_ENV` | | ✅ | | | |

**`APP_URL`** = Web App Workers URL  
**`QBITTORRENT_URL`** = qBittorrent Web UI  
兩者不同，勿填反。

---

## 授權與範圍

僅供白名單內的 Telegram 使用者；請自行保管 Bot token、qB 帳密與 `CRON_SECRET`。
