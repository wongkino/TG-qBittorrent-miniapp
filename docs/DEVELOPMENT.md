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

`DEV_PREVIEW` 只在 `NODE_ENV=development` 生效。

---

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev:env` | 複製 development 範本到 `.env.development.local` |
| `npm run dev` | Next 開發伺服器（Web App 於 `/`） |
| `npm run build` / `start` | Next production build |
| `npm run lint` | ESLint |
| `npm run preview` | OpenNext build + Wrangler preview |
| `npm run deploy` | OpenNext build + 部署 Workers（`--keep-vars`） |

---

## 本機測 Web App

| 方式 | 說明 |
|------|------|
| **本機預覽**（改 UI） | `DEV_PREVIEW=1` + `NEXT_PUBLIC_DEV_PREVIEW=1` |
| Deploy 後測真資料 | 開啟 Workers URL，Google 登入 |
| 真 qB 本機聯調 | 關掉 PREVIEW，填 `GOOGLE_CLIENT_ID`／`ALLOWED_GOOGLE_EMAILS` 與 qB |
| 介面語系 | App 內 **EN／繁／简／日** 手動切換（localStorage + 同步 KV） |

Google OAuth 本機設定見 [`env/development.example`](../env/development.example)。Authorized JavaScript origins 需包含 `http://localhost:3000` 與正式 Workers URL。

---

## 新增功能時怎麼接

### 新的 qBittorrent 操作
1. `lib/qbittorrent.ts` 加函式  
2. `app/api/qb/<name>/route.ts`（`requireAuth`；preview 用 `previewResponse`）  
3. `lib/client-api.ts` 加 client  
4. 接到 `components/*`；UI 字串加進 `lib/i18n.ts`（四語）

### 新的 UI 文案
只改 `lib/i18n.ts` 的 `zh-Hant`／`zh-Hans`／`en`／`ja`，元件用 `useI18n().t(...)`。

---

## 程式慣例

- 路徑別名：`@/` → 專案根
- API 錯誤：`AuthError`／`QBitError` → `handleApiError`
- 多 hash：`a|b|c`
- 不要在 client 放 qB 密碼
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
