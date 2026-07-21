# AI 文件入口

Cursor 會自動載入根目錄 [`AGENTS.md`](../../AGENTS.md)。本目錄補充**閱讀順序**與**任務步驟**。

## 首次進入 repo

1. [`AGENTS.md`](../../AGENTS.md) — 約束、分層、禁止事項
2. [`architecture/overview.md`](../architecture/overview.md) — 系統怎麼運作
3. [`architecture/codebase.md`](../architecture/codebase.md) — 檔案在哪
4. [`reference/environment.md`](../reference/environment.md) — 改 env 前必讀

## 依任務類型

| 任務 | 讀 |
|------|-----|
| 加 qB 功能 | [tasks.md](tasks.md) § 新增 API |
| 改 UI／文案 | [tasks.md](tasks.md) § UI 與 i18n |
| 部署／CI | [guides/deployment.md](../guides/deployment.md) |
| 認證問題 | [architecture/overview.md](../architecture/overview.md) § 認證 |
| 查 API | [reference/api-routes.md](../reference/api-routes.md) |

## 硬規則（摘要）

- qBittorrent **只**經 `lib/qbittorrent.ts`
- `/api/qb/*` 必須 `requireAuth`
- UI 字串只改 `lib/i18n.ts`（四語）
- 不提交 `.env*`、`.dev.vars`
- 回覆使用者用**繁體中文**

完整約束見 [`AGENTS.md`](../../AGENTS.md)。
