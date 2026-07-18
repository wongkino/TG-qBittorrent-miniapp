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
| `ALLOWED_TELEGRAM_USER_IDS` | 允許的 User ID（也是接收完成通知的 chat） |
| `QBITTORRENT_URL` | 例如 `https://dl.example.com`（不要 `:443`、不要結尾 `/`） |
| `APP_URL` | 部署後的 Mini App 網址，例如 `https://tg-dl.<subdomain>.workers.dev` |

本機也可用 `.env.local` / `.dev.vars`。

## 部署

Push 到 `main` 會觸發 [deploy workflow](.github/workflows/deploy-cloudflare.yml)。

部署後網址設進 BotFather Mini App。記得先對 Bot 發送 `/start`，完成通知才能傳到私聊。

## 下載完成通知

[notify workflow](.github/workflows/notify-completions.yml) 每 2 分鐘檢查一次：

- 若種子在近 15 分鐘內完成，且尚未標記 `tg-notified`
- 就向 `ALLOWED_TELEGRAM_USER_IDS` 發送「下載完成」訊息
- 並在 qBittorrent 幫該種子加上 `tg-notified` tag，避免重覆通知

也可手動在 Actions 跑 **Notify download completions**。

手動測試：

```bash
curl -X POST "$APP_URL/api/cron/completions" \
  -H "Authorization: Bearer $CRON_SECRET"
```
