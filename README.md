# Telegram Mini App → qBittorrent

個人專用 Mini App，經 Cloudflare Workers 代理連接 qBittorrent Web API。

## 本機開發

```bash
cp .env.example .env.local
npm install
npm run dev
```

## 環境變數 / GitHub Actions

**Secrets：** `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`TELEGRAM_BOT_TOKEN`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、`CRON_SECRET`

**Variables：**

| Variable | 說明 |
|----------|------|
| `APP_URL` | Mini App Workers URL，例如 `https://tg-dl.<subdomain>.workers.dev`（**不是** qBittorrent URL） |
| `ALLOWED_TELEGRAM_USER_IDS` | 允許的 User ID（Bot / 完成通知） |
| `QBITTORRENT_URL` | 例如 `https://dl.example.com` |

首次 Deploy 後，到 Cloudflare Dashboard 複製 Workers URL，設成 GitHub Variable `APP_URL`，再重新跑一次 Deploy（會註冊 webhook，並把輸入框左側 Menu Button 設成開啟 Mini App）。

也可在 [@BotFather](https://t.me/BotFather) → Bot Settings → Configure Mini App 綁定同一個 HTTPS URL。

## Bot

輸入框左側會出現 **開啟 App**（Menu Button）。Bot 每次回覆也會附上 Reply Keyboard：

| 按鈕 | 說明 |
|------|------|
| 狀態 | 總覽狀態與速度 |
| 列表 | 列出進行中種子 |
| 說明 | 顯示說明 |

也可直接傳 **magnet / torrent 連結**，或傳送 **`.torrent` 檔** 給 Bot。

## Mini App

- 排序：加入時間、名稱、進度、速度、大小、ETA
- 批次：多選後暫停／繼續／移除／刪檔
- 分類、貼上剪貼簿、完成通知（`tg-notified` tag）

## 下載完成通知

[notify workflow](.github/workflows/notify-completions.yml) 每 2 分鐘檢查一次近 15 分鐘內完成的種子。
