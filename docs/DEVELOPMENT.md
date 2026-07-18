# 開發指南（Development）

## 環境

- Node.js 22（CI 使用 22；本機建議相近）
- npm

```bash
cp .env.example .env.local
# 可選：Wrangler preview
cp .dev.vars.example .dev.vars

npm install
npm run dev
```

| 檔案 | 用途 |
|------|------|
| `.env.local` | `next dev`／本機 Next |
| `.dev.vars` | `npm run preview`（Wrangler） |
| `.env.example`／`.dev.vars.example` | 範本（已提交） |

`APP_URL` 不必寫進本機 env；那是 GitHub Variable。

---

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev` | Next 開發伺服器 |
| `npm run build` / `start` | 本機 production |
| `npm run lint` | ESLint |
| `npm run preview` | OpenNext build + Wrangler preview |
| `npm run deploy` | OpenNext build + 部署 Workers（`--keep-vars`） |

---

## 本機測 Mini App 的限制

API 需要合法 Telegram `initData`。用一般瀏覽器開 `localhost` 通常會 401。較實際的做法：

- Deploy 到 Workers 後用 Telegram「開啟 App」測
- 或在開發時暫時用已知 initData（僅本機、勿提交）

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
改 `lib/completions.ts`；用新 tag 去重；更新 [USER.md](USER.md)／[ARCHITECTURE.md](ARCHITECTURE.md)。

---

## 程式慣例

- 路徑別名：`@/` → 專案根（見 `tsconfig.json`）
- API 錯誤：丟 `AuthError`／`QBitError`，由 `handleApiError` 轉 JSON
- 多 hash：`a|b|c`
- UI 文案：繁體中文
- 不要在 client 放 bot token 或 qB 密碼

---

## 相關文件

- [ARCHITECTURE.md](ARCHITECTURE.md) — 流程與模組
- [DEPLOY.md](DEPLOY.md) — CI／Secrets
- [USER.md](USER.md) — 使用者操作
- [../AGENTS.md](../AGENTS.md) — AI agent 約束
