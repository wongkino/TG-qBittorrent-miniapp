# 環境變數參考

範本檔在 [`env/`](../../env/)（只放 `.example`，不放真值）。

## 範本檔

| 檔案 | 複製為 | 用於 |
|------|--------|------|
| `env/development.example` | `.env.development.local` | `npm run dev` |
| `env/wrangler.development.example` | `.dev.vars` | `npm run preview` |
| `env/production.example` | （對照用，勿提交真值） | GitHub／Worker |

---

## 變數一覽

| 變數 | 必要 | 說明 |
|------|:---:|------|
| `QBITTORRENT_URL` | prod | qB Web UI 根網址（勿尾隨 `/`） |
| `QBITTORRENT_USERNAME` | prod | qB 帳號 |
| `QBITTORRENT_PASSWORD` | prod | qB 密碼 |
| `GOOGLE_CLIENT_ID` | prod | OAuth Client ID；建置時映射為 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| `ALLOWED_GOOGLE_EMAILS` | prod | 逗號分隔 email 白名單 |
| `DEV_PREVIEW` | dev | `1` = server 假資料 |
| `NEXT_PUBLIC_DEV_PREVIEW` | dev | `1` = client 假資料 |
| `NEXTJS_ENV` | preview | Wrangler 用，設 `development` |
| `CLOUDFLARE_API_TOKEN` | CI | 僅 GitHub Actions |
| `CLOUDFLARE_ACCOUNT_ID` | CI | 僅 GitHub Actions |

---

## 擺放位置

| 變數 | 本機 `.env.development.local` | `.dev.vars` | Worker Secret | GitHub Secret | GitHub Variable |
|------|:---:|:---:|:---:|:---:|:---:|
| `QBITTORRENT_URL` | 可選 | ✅ | ✅ | | ✅ |
| `QBITTORRENT_USERNAME` | 可選 | ✅ | ✅ | ✅ | |
| `QBITTORRENT_PASSWORD` | 可選 | ✅ | ✅ | ✅ | |
| `GOOGLE_CLIENT_ID` | 可選 | ✅ | ✅ | | ✅ |
| `ALLOWED_GOOGLE_EMAILS` | 可選 | ✅ | ✅ | | ✅ |
| `DEV_PREVIEW` / `NEXT_PUBLIC_*` | dev | — | — | | |
| `CLOUDFLARE_*` | — | — | — | ✅ | |

Deploy 以 `wrangler secret bulk` 同步 Worker secrets。步驟見 [guides/deployment.md](../guides/deployment.md)。

---

## 本機快速開始

```bash
cp env/development.example .env.development.local
npm install
npm run dev
```

預設 `DEV_PREVIEW` 開啟，不需 qB 或 Google。

真機聯調：關閉兩個 `DEV_PREVIEW` flag，填入 qB 與 Google OAuth。
