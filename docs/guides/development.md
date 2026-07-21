# 開發指南（Development）

架構與目錄見 [architecture/codebase.md](../architecture/codebase.md)。

## 環境

- Node.js 22、npm
- 環境變數範本：`env/*.example`（[reference/environment.md](../reference/environment.md)）

```bash
cp env/development.example .env.development.local
npm install
npm run dev
```

| 模式 | 設定 | 用途 |
|------|------|------|
| **UI 預覽**（預設） | `DEV_PREVIEW=1` | 假種子／假 RSS，不需 qB／Google |
| **真機聯調** | 關閉 PREVIEW，填 qB + Google OAuth | 本機打真實 API |
| **Wrangler preview** | `cp env/wrangler.development.example .dev.vars` | `npm run preview` |

---

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev:env` | 複製 `env/development.example` → `.env.development.local` |
| `npm run dev` | Next 開發伺服器（`/`） |
| `npm run build` / `start` | Production build |
| `npm run lint` | ESLint |
| `npm run preview` | OpenNext + Wrangler 本機 preview |
| `npm run deploy` | 建置並部署 Cloudflare Workers |

---

## 新增 qBittorrent 功能

```
lib/qbittorrent.ts
    ↓
app/api/qb/<name>/route.ts    ← requireAuth, previewResponse
    ↓
lib/client-api.ts
    ↓
components/*                  ← lib/i18n.ts 四語字串
```

### 範例檢查清單

- [ ] `lib/qbittorrent.ts` 新函式
- [ ] `app/api/qb/.../route.ts` 使用 `requireAuth` + `handleApiError`
- [ ] `lib/dev/preview.ts` 假資料（若適用）
- [ ] `lib/client-api.ts` client 函式
- [ ] UI 元件 + `lib/i18n.ts`（zh-Hant／zh-Hans／en／ja）

---

## 程式慣例

| 項目 | 約定 |
|------|------|
| 路徑別名 | `@/` → 專案根 |
| API 錯誤 | `AuthError`／`QBitError` → `handleApiError` |
| 多 hash | `hash1\|hash2\|hash3` |
| qB 存取 | 只經 `lib/qbittorrent.ts` |
| 語系 | `useI18n().t("key")` |
| 認證過期 | `AuthSessionError`（401）→ `WebApp` 重登 |

---

## 相關文件

- [docs/README.md](../README.md) — 文件索引
- [architecture/codebase.md](../architecture/codebase.md)
- [guides/deployment.md](deployment.md)
- [guides/user.md](user.md)
- [ai/tasks.md](../ai/tasks.md)
- [AGENTS.md](../../AGENTS.md)
