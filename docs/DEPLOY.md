# 部署指南（Deploy）

## 前置

- 可從公網連線的 qBittorrent Web UI（建議 HTTPS）
- Telegram Bot token（[@BotFather](https://t.me/BotFather)）
- Cloudflare 帳號（Workers）
- 本 repo 的 GitHub Actions 權限
- 你的 Telegram User ID（白名單）

Worker 名稱固定為 **`tg-dl`**（`wrangler.jsonc`）。

---

## 變數放哪裡

### GitHub Secrets
`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`TELEGRAM_BOT_TOKEN`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、`CRON_SECRET`

### GitHub Variables
`ALLOWED_TELEGRAM_USER_IDS`、`QBITTORRENT_URL`、`APP_URL`

### 同步進 Cloudflare Worker Secrets（Deploy 自動）
`TELEGRAM_BOT_TOKEN`、`ALLOWED_TELEGRAM_USER_IDS`、`QBITTORRENT_URL`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、`CRON_SECRET`

### 不要放進 Worker
`APP_URL`、`CLOUDFLARE_*`（只給 Actions 用）

完整對照表見 [README](../README.md#環境變數總表)。

---

## 建議上線步驟

1. 在 GitHub 填好 **Secrets** 與 Variables（可先不填 `APP_URL`）
2. Push `main` 或手動跑 **Deploy to Cloudflare Workers**
3. Cloudflare Dashboard → Workers → `tg-dl` → 複製網址  
   例如 `https://tg-dl.xxxx.workers.dev`
4. 設 GitHub Variable **`APP_URL`**（不要尾隨 `/`）
5. **再跑一次 Deploy**（寫入 webhook + Menu Button）
6. （可選）BotFather → Configure Mini App → 同一 HTTPS URL
7. 打開 Bot，確認「開啟 App」與鍵盤；試加一筆 magnet

---

## Workflows

### Deploy — `.github/workflows/deploy-cloudflare.yml`

觸發：push `main`／`master`，或 `workflow_dispatch`

步驟：

1. `npm ci` + `npm run deploy`（OpenNext build + wrangler deploy）
2. `wrangler secret bulk` 同步 runtime secrets
3. `setWebhook` → `{APP_URL}/api/telegram/webhook`（`secret_token` = `CRON_SECRET`）
4. `setChatMenuButton` → web_app「開啟 App」→ `APP_URL`

### Notify — `.github/workflows/notify-completions.yml`

觸發：cron `*/2 * * * *`，或手動

呼叫：

```http
POST {APP_URL}/api/cron/completions
Authorization: Bearer {CRON_SECRET}
Content-Type: application/json
```

---

## Cloudflare API Token 權限（參考）

需能：

- 部署 Workers
- 管理 Worker secrets
- （若流程有查 subdomain）讀取 account workers subdomain

Account ID 在 Cloudflare Dashboard 右側可見。

---

## 本機手動部署（可選）

```bash
cp .dev.vars.example .dev.vars   # 填入 runtime 變數
npm install
npm run deploy
```

仍需自行呼叫 Telegram `setWebhook`／`setChatMenuButton`，或依賴 GitHub Deploy job。

---

## 驗證清單

- [ ] Workers 網址可開（頁面可載入）
- [ ] `APP_URL` Variable = 該網址
- [ ] Bot 左側有「開啟 App」
- [ ] Reply Keyboard 有三鍵
- [ ] Mini App 能列出種子
- [ ] Bot 能加 magnet
- [ ] notify workflow 手動跑一次成功（Actions 日誌）

---

## 故障排除

| 現象 | 檢查 |
|------|------|
| Webhook 無效 | `APP_URL`、是否二次 Deploy、`CRON_SECRET` 一致 |
| `gh variable set` 403 | 預期；改手動設 Variable |
| qB 502／登入失敗 | `QBITTORRENT_URL`、帳密、公網連通、反向代理 CSRF |
| 通知全無 | notify workflow、Bearer、`APP_URL`、白名單、15 分鐘視窗 |
| Menu Button 沒出現 | 二次 Deploy；或 BotFather Configure Mini App |

**切記：** `APP_URL` ≠ `QBITTORRENT_URL`。
