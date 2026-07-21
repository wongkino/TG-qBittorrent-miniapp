# API Routes 參考

`lib/client-api.ts` → `app/api/qb/*` → `lib/qbittorrent.ts` → qBittorrent

所有 route 皆經 `requireAuth`（或 `DEV_PREVIEW` 的 `previewResponse`）。

---

## 下載

| client-api | HTTP | Route 檔案 | qBittorrent |
|------------|------|------------|-------------|
| `fetchSnapshot` | `GET /api/qb/snapshot` | `snapshot/route.ts` | torrents + categories |
| `fetchTorrents` | `GET /api/qb/torrents` | `torrents/route.ts` | `GET /api/v2/torrents/info` |
| `addTorrentUrl` | `POST /api/qb/add` | `add/route.ts` | `POST /api/v2/torrents/add` |
| `pauseTorrent` | `POST /api/qb/pause` | `pause/route.ts` | `stop` → `pause` |
| `resumeTorrent` | `POST /api/qb/resume` | `resume/route.ts` | `start` → `resume` |
| `deleteTorrent` | `POST /api/qb/delete` | `delete/route.ts` | `POST /api/v2/torrents/delete` |
| `setTorrentCategory` | `POST /api/qb/category` | `category/route.ts` | `setCategory` |

## RSS

| client-api | HTTP | Route 檔案 | qBittorrent |
|------------|------|------------|-------------|
| `fetchRssFeeds` | `GET /api/qb/rss` | `rss/route.ts` | `/api/v2/rss/items` 等 |
| `addRssFeed` | `POST /api/qb/rss/add` | `rss/add/route.ts` | addFeed |
| `removeRssFeed` | `POST /api/qb/rss/remove` | `rss/remove/route.ts` | removeItem |
| `refreshRssFeed` | `POST /api/qb/rss/refresh` | `rss/refresh/route.ts` | refreshItem |
| `markRssRead` | `POST /api/qb/rss/read` | `rss/read/route.ts` | markAsRead |

---

## 慣例

- **多 hash**：request body `hashes` 以 `|` 串接（`lib/api.ts` 的 `readHashesBody`）
- **錯誤**：`AuthError`／`QBitError` → `handleApiError`
- **401**：client 拋 `AuthSessionError` → `WebApp` 重登

## 新增 route 檢查

1. `lib/qbittorrent.ts` 函式
2. `app/api/qb/<name>/route.ts`
3. `lib/client-api.ts` 函式
4. `lib/dev/preview.ts` 假資料（若適用）

詳見 [ai/tasks.md](../ai/tasks.md)。
