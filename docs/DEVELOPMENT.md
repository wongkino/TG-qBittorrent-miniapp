# 開發指南（Development）

## 環境

- Node.js 22（CI 使用 22；本機建議相近）
- npm

環境變數 **dev／prod 分開**，範本在 [`env/`](../env/)（說明見 [`env/README.md`](../env/README.md)）。

```bash
cp env/development.example .env.development.local
# 可選：Wrangler preview
cp env/wrangler.development.example .dev.vars

npm install
npm run dev
```

瀏覽器開 http://localhost:3000。預設 `DEV_PREVIEW` → 假種子／假 RSS，熱重載。

| 檔案 | 環境 | 用途 |
|------|------|------|
| `env/development.example` → `.env.development.local` | **dev** | `next dev` |
| `env/wrangler.development.example` → `.dev.vars` | **dev** | Wrangler preview |
| `env/production.example` | **prod** 對照 | GitHub／Worker secrets（勿提交真值） |

`APP_URL` 不必寫進本機 env。  
`DEV_PREVIEW` 只在 `NODE_ENV=development` 生效。

---

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev:env` | 複製 development 範本到 `.env.development.local` |
| `npm run dev` | Next 開發伺服器（`/` Mini App、`/webapp/` iOS Web App） |
| `npm run build` / `start` | Next production build |
| `npm run lint` | ESLint |
| `npm run preview` | OpenNext build + Wrangler preview |
| `npm run deploy` | OpenNext build + 部署 Workers（`--keep-vars`） |

---

## 本機測 Mini App

| 方式 | 說明 |
|------|------|
| **本機預覽**（改 UI） | `DEV_PREVIEW=1` + `NEXT_PUBLIC_DEV_PREVIEW=1` |
| Deploy 後測真資料 | Telegram「開啟 App」 |
| 真 qB 本機聯調 | 關掉 PREVIEW，填 bot／qB；需合法 initData（tunnel + TG） |
| 介面語系 | App 內 **EN／繁／简／日** 手動切換（localStorage + 同步 KV，Bot 共用） |

Bot／cron 可用 curl 打已部署端點（帶 secret）。

---

## 本機測 iOS Web App（Next.js React + Google OAuth）

路徑 `{APP_URL}/webapp/`（與 Mini App 同一個 Next.js app）。登入使用 **Google OAuth**（email 須在 `ALLOWED_GOOGLE_EMAILS` 白名單）。

1. [Google Cloud Console](https://console.cloud.google.com/) 建立 OAuth Web client  
   - Authorized JavaScript origins：`http://localhost:3000`、`https://你的-workers-url`
2. 本機 `.env.development.local` / `.dev.vars`：

```bash
GOOGLE_CLIENT_ID=你的-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的-client-id.apps.googleusercontent.com
ALLOWED_GOOGLE_EMAILS=you@gmail.com
```

```bash
npm run dev
```

瀏覽器開 http://localhost:3000/webapp/ → Google 登入。

正式環境：Deploy 時 GitHub Variable `GOOGLE_CLIENT_ID` 會注入 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 建置前端。

---

## 新增功能時怎麼接

### 新的 qBittorrent 操作
1. `lib/qbittorrent.ts` 加函式  
2. `app/api/qb/<name>/route.ts`（`requireAuth`；preview 用 `previewResponse`）  
3. `lib/client-api.ts` 加 client  
4. 接到 `components/*`；UI 字串加進 `lib/i18n.ts`（四語）

### 新的 Bot 指令／按鈕
改 `lib/bot-handler.ts` 與 `lib/i18n.ts` 的 `bot.*`；回覆附語系對應的 Reply Keyboard。語系由 Mini App 同步到 KV（`lib/user-locale.ts`）。

### 新的通知類型
改 `lib/completions.ts`；新 tag 去重；確認 `worker.ts` scheduled。更新 [USER.md](USER.md)／[ARCHITECTURE.md](ARCHITECTURE.md)。

### 新的 UI 文案
只改 `lib/i18n.ts` 的 `zh-Hant`／`zh-Hans`／`en`／`ja`，元件用 `useI18n().t(...)`。

---

## 程式慣例

- 路徑別名：`@/` → 專案根
- API 錯誤：`AuthError`／`QBitError` → `handleApiError`
- 多 hash：`a|b|c`
- 不要在 client 放 bot token 或 qB 密碼
- qB 只經 `lib/qbittorrent.ts`
- 預覽假資料：`lib/dev/preview.ts`

---

## 相關文件

- [README.md](README.md) — 文件索引  
- [ARCHITECTURE.md](ARCHITECTURE.md)  
- [DEPLOY.md](DEPLOY.md)  
- [USER.md](USER.md)  
- [../env/README.md](../env/README.md)  
- [../AGENTS.md](../AGENTS.md)  
