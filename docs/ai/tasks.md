# AI 任務指引

配合 [`AGENTS.md`](../../AGENTS.md) 使用。每項任務列出**必讀檔案**與**修改順序**。

---

## 新增 qBittorrent API 功能

**必讀**：`lib/qbittorrent.ts`、`lib/api.ts`、任一現有 `app/api/qb/*/route.ts`

```
1. lib/qbittorrent.ts          新增 qB API 封裝
2. app/api/qb/<name>/route.ts  requireAuth + previewResponse + handleApiError
3. lib/dev/preview.ts          假資料（若 DEV_PREVIEW 需支援）
4. lib/client-api.ts           瀏覽器 fetch 函式
5. components/*                UI
6. lib/i18n.ts                 四語字串（zh-Hant, zh-Hans, en, ja）
```

**勿**：在 component 或 route 直接 `fetch(QBITTORRENT_URL)`。

---

## 改 UI 或文案

**必讀**：`lib/i18n.ts`、目標 `components/*.tsx`

- 字串只加在 `lib/i18n.ts` 四個 locale 區塊
- 元件用 `useI18n().t("key")`
- 新元件放 `components/`，維持現有命名風格

---

## 改認證

**必讀**：`lib/auth.ts`、`lib/google-auth.ts`、`components/WebApp.tsx`

- `/api/qb/*` 一律 `requireAuth`
- 前端 Bearer 走 `lib/client-auth.ts`
- 401 回傳後 client 拋 `AuthSessionError`

---

## 部署或改 CI

**必讀**：`docs/guides/deployment.md`、`.github/workflows/deploy-cloudflare.yml`、`wrangler.jsonc`

- Secrets 不提交 repo
- `GOOGLE_CLIENT_ID` 需在 build 時注入（見 workflow `env:`）
- 不擅自改 Worker 名稱 `tg-dl`

---

## 改環境變數

**必讀**：`docs/reference/environment.md`、`env/*.example`

- 範本只放 `env/*.example`
- 同步更新 `production.example`、deploy workflow、本文件

---

## 除錯 checklist

| 現象 | 查 |
|------|-----|
| 401 / 重複登入 | token 過期、`ALLOWED_GOOGLE_EMAILS`、Google origins |
| qB 502 | `QBITTORRENT_URL`、CSRF Origin/Referer、帳密 |
| 登入按鈕不見 | `GOOGLE_CLIENT_ID` 建置注入、`NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| 本機白屏 | `DEV_PREVIEW` 兩個 flag 是否一致 |
| lint 失敗 | `npm run lint`；避免 effect 內同步 setState |

---

## 文件維護

改架構或目錄時，同步更新：

1. `docs/architecture/codebase.md` — 目錄樹
2. `docs/reference/api-routes.md` — 若有新 route
3. `docs/reference/environment.md` — 若有新 env
4. `AGENTS.md` — 若邊界規則變了
