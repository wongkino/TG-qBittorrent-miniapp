# 開發指南（Development）

## 環境

- Node.js 22（CI 使用 22；本機建議相近）
- npm

環境變數 **dev／prod 分開**，範本在 [`env/`](../env/)。

```bash
cp env/development.example .env.development.local
# 可選：Wrangler preview
cp env/wrangler.development.example .dev.vars

npm install
npm run dev
```

瀏覽器開 http://localhost:3000。預設 `DEV_PREVIEW` 開啟 → 假種子／假 RSS，改 CSS／元件會熱重載。

| 檔案 | 環境 | 用途 |
|------|------|------|
| `env/development.example` → `.env.development.local` | **dev** | `next dev` |
| `env/wrangler.development.example` → `.dev.vars` | **dev** | Wrangler preview |
| `env/production.example` | **prod** 對照 | GitHub／Worker secrets（勿提交真值） |

`APP_URL` 不必寫進本機 env；那是 GitHub Variable。  
`DEV_PREVIEW` 只在 `NODE_ENV=development` 生效，**不會**進 production Worker。

---

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev:env` | 複製 development 範本到 `.env.development.local` |
| `npm run dev` | Next 開發伺服器（熱重載） |
| `npm run build` / `start` | 本機 production build（讀 production env，不含 DEV_PREVIEW） |
| `npm run lint` | ESLint |
| `npm run preview` | OpenNext build + Wrangler preview |
| `npm run deploy` | OpenNext build + 部署 Workers（`--keep-vars`） |

---

## 本機測 Mini App 的限制

正式 API 需要合法 Telegram `initData`。一般瀏覽器開 `localhost` 沒有 initData。

| 方式 | 說明 |
|------|------|
| **本機預覽**（建議改 UI） | `.env.development.local` 內 `DEV_PREVIEW=1` |
| Deploy 後測真資料 | Telegram「開啟 App」 |
| 真 qB 本機聯調 | 關掉 PREVIEW，在 `.env.development.local` 填 bot／qB |
| 介面語系 | 自動跟 Telegram `user.language_code`：**繁中**／**簡中**／**英文**；本機預覽跟瀏覽器語系 |

Bot／cron 可用 curl 打已部署的端點（帶正確 secret）。

---

## 新增功能時怎麼接

### 新的 qBittorrent 操作
1. 在 `lib/qbittorrent.ts` 加函式  
2. 加 `app/api/qb/<name>/route.ts`（記得 `requireAuth`）  
3. 在 `lib/client-api.ts` 加 client  
4. 接到 `components/*`

### 新的 Bot 指令／按鈕
改 `lib/bot-handler.ts`；若要持久鍵盤，維持每次 `reply` 附 `MAIN_KEYBOARD`。

### 新的通知類型
改 `lib/completions.ts`；用新 tag 去重；排程入口在 `worker.ts` `scheduled`（`wrangler.jsonc` cron）。更新 [USER.md](USER.md)／[ARCHITECTURE.md](ARCHITECTURE.md)。

---

## 程式慣例

- 路徑別名：`@/` → 專案根（見 `tsconfig.json`）
- API 錯誤：丟 `AuthError`／`QBitError`，由 `handleApiError` 轉 JSON
- 多 hash：`a|b|c`
- UI 文案：繁體中文
- 不要在 client 放 bot token 或 qB 密碼
- 本機預覽假資料：`lib/dev/preview.ts`（僅 development）

---

## 相關文件

- [env/README.md](../env/README.md) — env 擺放
- [ARCHITECTURE.md](ARCHITECTURE.md) — 流程與模組
- [DEPLOY.md](DEPLOY.md) — CI／Secrets
- [USER.md](USER.md) — 使用者操作
- [../AGENTS.md](../AGENTS.md) — AI agent 約束
