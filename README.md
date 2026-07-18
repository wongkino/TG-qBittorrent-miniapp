# Telegram Mini App → qBittorrent

個人專用 Mini App，經 Cloudflare Workers 代理連接 qBittorrent Web API。

## 本機開發

```bash
cp .env.example .env.local
npm install
npm run dev
```

## 環境變數 / GitHub Actions

**Secrets：** `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`TELEGRAM_BOT_TOKEN`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`

**Variables：** `ALLOWED_TELEGRAM_USER_IDS`、`QBITTORRENT_URL`（例如 `https://dl.example.com`，不要 `:443`、不要結尾 `/`）

本機也可用 `.env.local` 或 `.dev.vars`（見 `.env.example` / `.dev.vars.example`）。

## 部署

Push 到 `main` 會觸發 [GitHub Actions](.github/workflows/deploy-cloudflare.yml) 部署到 Cloudflare Workers。

部署後網址類似 `https://tg-dl.<subdomain>.workers.dev`，設進 BotFather Mini App 即可。

手動部署：`npm run deploy`
