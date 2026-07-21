# AGENTS.md — AI / Cursor 開發指引

> **文件地圖**：[`docs/README.md`](docs/README.md) · **任務步驟**：[`docs/ai/tasks.md`](docs/ai/tasks.md)

## 專案

個人 **qBittorrent Web App**（Google 登入、PWA），經 Cloudflare Workers（OpenNext）代理 qBittorrent。

- Worker：`tg-dl`（`wrangler.jsonc`）
- 語系：四語，`localStorage`（`lib/i18n.ts`）
- 白名單個人工具；勿做成 SaaS

## 分層（必記）

```
components/* → lib/client-api.ts → app/api/qb/* → lib/qbittorrent.ts → qB
```

| 層 | 路徑 | 規則 |
|----|------|------|
| UI | `components/` | client only；字串 → `lib/i18n.ts` |
| 前端 API | `lib/client-api.ts` | 只打 `/api/qb/*` |
| Route | `app/api/qb/*/route.ts` | `requireAuth` |
| qB | `lib/qbittorrent.ts` | **唯一**打 qBittorrent |
| 認證 | `lib/auth.ts`, `lib/google-auth.ts` | JWT 驗證 |

## 閱讀順序

1. [`docs/architecture/overview.md`](docs/architecture/overview.md)
2. [`docs/architecture/codebase.md`](docs/architecture/codebase.md)
3. [`docs/reference/api-routes.md`](docs/reference/api-routes.md)
4. [`docs/reference/environment.md`](docs/reference/environment.md)
5. [`docs/ai/tasks.md`](docs/ai/tasks.md) — 依任務查步驟

## 硬規則

- `/api/qb/*` → `Bearer <Google ID token>` + `ALLOWED_GOOGLE_EMAILS`
- 本機預覽 → `Bearer dev-preview`（雙 `DEV_PREVIEW` flag）
- qB CSRF：`Origin`/`Referer` 正確；pause 先 `stop` 再 `pause`
- 不提交 `.env*`、`.dev.vars`
- 回覆使用者用**繁體中文**
- 新功能：`qbittorrent` → route → `client-api` → component + `i18n`（四語）

## 部署

[`docs/guides/deployment.md`](docs/guides/deployment.md) · `env/production.example`
