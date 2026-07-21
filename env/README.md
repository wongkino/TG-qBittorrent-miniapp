# 環境變數

範本檔與擺放位置。總表見 [README.md](../README.md#環境變數)。

## 範本檔

| 檔案 | 複製為 | 用於 |
|------|--------|------|
| [development.example](development.example) | `.env.development.local` | `npm run dev` |
| [wrangler.development.example](wrangler.development.example) | `.dev.vars` | `npm run preview`、手動 deploy |
| [production.example](production.example) | （勿提交真值） | 對照 GitHub／Worker secrets |

## 變數說明

| 變數 | 必要 | 說明 |
|------|:---:|------|
| `QBITTORRENT_URL` | ✅ prod | qB Web UI 根網址（勿尾隨 `/`） |
| `QBITTORRENT_USERNAME` | ✅ prod | qB 帳號 |
| `QBITTORRENT_PASSWORD` | ✅ prod | qB 密碼 |
| `GOOGLE_CLIENT_ID` | ✅ prod | Google OAuth Client ID（建置時注入前端） |
| `ALLOWED_GOOGLE_EMAILS` | ✅ prod | 逗號分隔 email 白名單 |
| `DEV_PREVIEW` | dev | `1` = 本機假資料（server） |
| `NEXT_PUBLIC_DEV_PREVIEW` | dev | `1` = 本機假資料（client） |
| `NEXTJS_ENV` | preview | Wrangler 用，設 `development` |
| `CLOUDFLARE_API_TOKEN` | CI | 僅 GitHub Actions |
| `CLOUDFLARE_ACCOUNT_ID` | CI | 僅 GitHub Actions |

## 本機快速開始

```bash
cp env/development.example .env.development.local
npm install
npm run dev
```

預設 `DEV_PREVIEW` 開啟，不需 qB 或 Google。

真機聯調：關閉兩個 `DEV_PREVIEW` flag，填入 qB 與 `GOOGLE_CLIENT_ID`／`ALLOWED_GOOGLE_EMAILS`。

## 正式環境

Secrets／Variables 設在 GitHub；Deploy workflow 以 `wrangler secret bulk` 同步至 Worker。

步驟見 [docs/DEPLOY.md](../docs/DEPLOY.md)。
