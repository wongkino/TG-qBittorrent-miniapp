# Telegram Mini App → qBittorrent

個人專用 Telegram Bot + Mini App，經 **Cloudflare Workers**（OpenNext）代理連接 **qBittorrent Web API**。

| | |
|--|--|
| Worker | `tg-dl` |
| 預設 URL | `https://tg-dl.<subdomain>.workers.dev` |
| 認證 | Mini App `initData` + User ID 白名單 |

---

## 文件索引

| 文件 | 對象 | 內容 |
|------|------|------|
| [docs/USER.md](docs/USER.md) | 使用者 | Mini App／Bot 操作、通知、常見問題 |
| [docs/DEPLOY.md](docs/DEPLOY.md) | 管理員 | Secrets、Deploy 步驟、Workflow、驗證清單 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 開發者 | 架構圖、請求流、模組、認證 |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | 開發者 | 本機環境、scripts、擴充方式 |
| [AGENTS.md](AGENTS.md) | AI／Cursor | 開發約束與必讀注意事項 |

範例環境變數（dev／prod 分開）：

- [`env/`](env/) — 說明與範本
- [`env/development.example`](env/development.example) — 本機 `next dev`
- [`env/production.example`](env/production.example) — 正式 secrets 對照
- [`env/wrangler.development.example`](env/wrangler.development.example) — Wrangler preview

---

## 功能速覽

- **Mini App**：列表、排序、批次、加 magnet／URL、分類、**RSS 訂閱與加入下載**
- **Bot**：狀態／列表／說明鍵盤、magnet、`.torrent` 檔、左側開啟 App
- **通知**：下載開始（`tg-started`）、下載完成（`tg-notified`）；由 **Cloudflare Cron** 每 5 分鐘檢查

---

## 快速開始

### 本機（dev）

```bash
cp env/development.example .env.development.local
npm install
npm run dev
```

### 上線（prod 摘要）

1. 設定 GitHub Secrets／Variables（見 [DEPLOY.md](docs/DEPLOY.md)、[`env/production.example`](env/production.example)）
2. Deploy 一次 → 複製 Workers URL → 設 `APP_URL` → **再 Deploy 一次**
3. 在 Telegram 開啟 Bot 測試

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
| `DEV_PREVIEW` / `NEXT_PUBLIC_DEV_PREVIEW` | ✅ dev only | ❌ | ❌ | | |
| `APP_URL` | ❌ | ❌ | ❌ | | ✅ |
| `CLOUDFLARE_API_TOKEN` | | | | ✅ | |
| `CLOUDFLARE_ACCOUNT_ID` | | | | ✅ | |
| `NEXTJS_ENV` | | ✅ | | | |

**`APP_URL`** = Mini App Workers URL（例如 `https://tg-dl.xxx.workers.dev`）  
**`QBITTORRENT_URL`** = qBittorrent Web UI（例如 `https://dl.example.com`）  
兩者不同，勿填反。

---

## 授權與範圍

僅供白名單內的 Telegram 使用者使用；請自行保管 Bot token、qB 帳密與 `CRON_SECRET`。
