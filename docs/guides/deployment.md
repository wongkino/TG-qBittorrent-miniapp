# 部署指南（Deploy）

架構見 [architecture/overview.md](../architecture/overview.md)。環境變數見 [reference/environment.md](../reference/environment.md)。

## 前置

- 可從公網連線的 qBittorrent Web UI（建議 HTTPS）
- Cloudflare 帳號（Workers）
- 本 repo 的 GitHub Actions 權限
- Google OAuth Client ID 與白名單 email

Worker 名稱固定為 **`qb`**（`wrangler.jsonc`）。

---

## 變數放哪裡

### GitHub Secrets
`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`

### GitHub Variables
`ALLOWED_GOOGLE_EMAILS`、`GOOGLE_CLIENT_ID`、`QBITTORRENT_URL`

### 同步進 Cloudflare Worker Secrets（Deploy 自動）
`QBITTORRENT_URL`、`QBITTORRENT_USERNAME`、`QBITTORRENT_PASSWORD`、（若已設定）`GOOGLE_CLIENT_ID`、`ALLOWED_GOOGLE_EMAILS`

### 不要放進 Worker
`CLOUDFLARE_*`（只給 Actions 用）

完整對照表見 [reference/environment.md](../reference/environment.md)、[`env/production.example`](../../env/production.example)。

---

## 建議上線步驟

1. 在 GitHub 填好 **Secrets** 與 **Variables**
2. Push `main` 或手動跑 **Deploy to Cloudflare Workers**
3. Cloudflare Dashboard → Workers → `qb` → 複製網址
4. 開啟 Workers URL → Google 登入測試
5. （可選）Safari：**分享 → 加入主畫面**

Google Cloud Console 的 Authorized JavaScript origins 需包含 Workers URL 與本機 `http://localhost:3000`。

---

## Workflow

### Deploy — `.github/workflows/deploy-cloudflare.yml`

觸發：push `main`／`master`，或 `workflow_dispatch`

步驟：

1. `npm ci`
2. `npm run deploy`（OpenNext build + wrangler deploy）
3. `wrangler secret bulk` 同步 runtime secrets

---

## Cloudflare API Token 權限（參考）

需能部署 Workers、管理 secrets。

---

## 本機手動部署（可選）

```bash
cp env/wrangler.development.example .dev.vars
npm install
npm run deploy
```

---

## 驗證清單

- [ ] Workers 網址可開
- [ ] Google 登入成功
- [ ] Web App 能列出種子
- [ ] 能加 magnet／URL

---

## 故障排除

| 現象 | 檢查 |
|------|------|
| qB 502／登入失敗 | `QBITTORRENT_URL`、帳密、公網、CSRF |
| Google 登入失敗 | `GOOGLE_CLIENT_ID`、`ALLOWED_GOOGLE_EMAILS`、Authorized origins |
| 登入按鈕沒出現 | 建置時是否注入 `GOOGLE_CLIENT_ID`（Deploy env） |
