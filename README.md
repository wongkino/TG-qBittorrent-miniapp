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
| `ALLOWED_TELEGRAM_USER_IDS` | 允許的 User ID（Bot / 完成通知） |
| `QBITTORRENT_URL` | 例如 `https://dl.example.com` |
| `APP_URL` | **部署時自動寫入**（`https://tg-dl.<subdomain>.workers.dev`），通常不必手動設 |

每次 Deploy 成功後會：
1. 向 Cloudflare 查詢 workers.dev 子網域，算出 `APP_URL`
2. 存成 GitHub Variable `APP_URL`
3. 自動 `setWebhook` 到 `$APP_URL/api/telegram/webhook`

## Bot 指令

先對 Bot 發送 `/start`。

| 指令 | 說明 |
|------|------|
| `/status` | 總覽狀態與速度 |
| `/list` | 列出進行中種子 |
| `/help` | 說明 |

也可直接傳 **magnet / torrent 連結**，或傳送 **`.torrent` 檔** 給 Bot。

## Mini App

- 排序：加入時間、名稱、進度、速度、大小、ETA
- 批次：多選後暫停／繼續／移除／刪檔
- 分類、貼上剪貼簿、完成通知（`tg-notified` tag）

## 下載完成通知

[notify workflow](.github/workflows/notify-completions.yml) 每 2 分鐘檢查一次近 15 分鐘內完成的種子（使用自動寫入的 `APP_URL`）。
