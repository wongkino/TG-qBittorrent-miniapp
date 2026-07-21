# 部署指南（Deploy）

## 前置

- 可從公網連線的 qBittorrent Web UI（建議 HTTPS）
- Telegram Bot token（[@BotFather](https://t.me/BotFather)）
- Cloudflare 帳號（Workers）
- 本 repo 的 GitHub Actions 權限
- 你的 Telegram User ID（白名單）

Worker 名稱固定為 **`tg-dl`**（`wrangler.jsonc`）。  
通知排程由 **Cloudflare Cron**（`*/5 * * * *`）執行，**不是** GitHub Actions。

---

## 變數放哪裡

### GitHub Secrets
`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`TELEGRAM_BOT_TOKEN`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、`CRON_SECRET`、（可選）`WEB_APP_TOKEN`

### GitHub Variables
`ALLOWED_TELEGRAM_USER_IDS`、`QBITTORRENT_URL`、`APP_URL`

### 同步進 Cloudflare Worker Secrets（Deploy 自動）
`TELEGRAM_BOT_TOKEN`、`ALLOWED_TELEGRAM_USER_IDS`、`QBITTORRENT_URL`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、`CRON_SECRET`、（若已設定）`WEB_APP_TOKEN`

### 不要放進 Worker
`APP_URL`、`CLOUDFLARE_*`（只給 Actions 用）

完整對照表見 [README](../README.md#環境變數總表)、[`env/production.example`](../env/production.example)。文件索引：[docs/README.md](README.md)。

---

## 建議上線步驟

1. 在 GitHub 填好 **Secrets** 與 Variables（可先不填 `APP_URL`）
2. Push `main` 或手動跑 **Deploy to Cloudflare Workers**
3. Cloudflare Dashboard → Workers → `tg-dl` → 複製網址  
   例如 `https://tg-dl.xxxx.workers.dev`
4. 設 GitHub Variable **`APP_URL`**（不要尾隨 `/`）
5. **再跑一次 Deploy**（寫入 webhook + Menu Button）
6. 確認 Workers → Triggers 有 cron `*/5 * * * *`
7. （可選）BotFather → Configure Mini App → 同一 HTTPS URL
8. 打開 Bot 測試；加一筆種子後等約 5 分鐘內看「下載開始」通知
9. （可選）iOS Web App：Safari 開 `{APP_URL}/webapp/` → 輸入 `WEB_APP_TOKEN` → 加入主畫面

---

## Workflows

### Deploy — `.github/workflows/deploy-cloudflare.yml`

觸發：push `main`／`master`，或 `workflow_dispatch`

步驟：

1. `npm ci`
2. 確保／建立 KV `tg-dl-user-prefs`，寫入 `wrangler.jsonc` 的 `USER_PREFS`
3. `npm run deploy`（OpenNext build + wrangler deploy；含 Cron Trigger）
4. `wrangler secret bulk` 同步 runtime secrets
5. `setWebhook` → `{APP_URL}/api/telegram/webhook`（`secret_token` = `CRON_SECRET`）
6. `setChatMenuButton` → web_app「開啟 App」→ `APP_URL`

### 通知 — Cloudflare Cron（非 GitHub Actions）

設定在 `wrangler.jsonc`：

```jsonc
"triggers": { "crons": ["*/5 * * * *"] }
```

執行：`worker.ts` → `scheduled()` → 內部 `POST /api/cron/completions`。

手動測試（已部署後）：

```bash
curl -X POST "$APP_URL/api/cron/completions" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

本機（需先 build／preview）：

```bash
npx wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=*/2+*+*+*+*"
```

---

## Cloudflare API Token 權限（參考）

需能部署 Workers、管理 secrets、設定 Cron Triggers。

---

## 本機手動部署（可選）

```bash
cp env/wrangler.development.example .dev.vars
npm install
npm run deploy
```

仍需自行呼叫 Telegram `setWebhook`／`setChatMenuButton`，或依賴 GitHub Deploy job。

---

## 驗證清單

- [ ] Workers 網址可開
- [ ] `APP_URL` Variable = 該網址
- [ ] Bot 左側有「開啟 App」
- [ ] Reply Keyboard 有三鍵
- [ ] Mini App 能列出種子
- [ ] Bot 能加 magnet
- [ ] Cloudflare Worker 有 Cron `*/5 * * * *`
- [ ] 手動 `POST /api/cron/completions` 回 200（或等自動通知）

---

## 故障排除

| 現象 | 檢查 |
|------|------|
| Webhook 無效 | `APP_URL`、是否二次 Deploy、`CRON_SECRET` 一致 |
| `gh variable set` 403 | 預期；改手動設 Variable |
| qB 502／登入失敗 | `QBITTORRENT_URL`、帳密、公網、CSRF |
| 通知全無 | Worker Cron 是否啟用、`CRON_SECRET`、白名單、15 分鐘視窗、Workers 日誌 |
| Menu Button 沒出現 | 二次 Deploy；或 BotFather Configure Mini App |

**切記：** `APP_URL` ≠ `QBITTORRENT_URL`。
