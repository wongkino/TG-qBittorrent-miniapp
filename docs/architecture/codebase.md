# 程式目錄

分層說明見 [overview.md](overview.md)。

```
tg-dl/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 根路由 → <WebApp />
│   ├── layout.tsx                # PWA meta、主題 boot、globals.css
│   ├── globals.css
│   └── api/qb/                   # 後端 API（需 Google 登入或 DEV_PREVIEW）
│       ├── snapshot/route.ts     # GET  torrents + categories
│       ├── torrents/route.ts     # GET  輪詢用
│       ├── add/route.ts          # POST magnet/URL
│       ├── pause/route.ts
│       ├── resume/route.ts
│       ├── delete/route.ts
│       ├── category/route.ts
│       └── rss/                    # add, remove, refresh, read, route.ts
│
├── components/                   # React client（見下方分組）
├── lib/                          # 共用邏輯（見下方分組）
├── types/google-gis.d.ts
├── public/                       # manifest.webmanifest, icon.svg, _headers
├── env/*.example                 # 環境變數範本（說明見 reference/environment.md）
├── docs/                         # 說明文件（見 docs/README.md）
├── worker.ts                     # Cloudflare 入口
├── wrangler.jsonc
├── next.config.ts
└── open-next.config.ts
```

---

## components/ 分組

| 分組 | 檔案 | 職責 |
|------|------|------|
| **殼層** | `WebApp.tsx`, `GoogleSignIn.tsx` | 登入、session、過期重登 |
| **殼層** | `I18nProvider.tsx`, `LanguageToggle.tsx`, `ThemeToggle.tsx` | 語系、主題 |
| **下載** | `QbDashboard.tsx`, `TorrentList.tsx`, `TorrentRow.tsx` | 主畫面、列表 |
| **下載** | `ListToolbar.tsx`, `AddTorrentForm.tsx`, `CategorySelect.tsx` | 工具列、加種 |
| **RSS** | `RssPanel.tsx` | RSS 訂閱 |
| **共用** | `icons.tsx` | SVG 圖示 |

---

## lib/ 分組

| 分組 | 檔案 | 環境 |
|------|------|------|
| **認證** | `auth.ts`, `google-auth.ts`, `google-session.ts`, `google-client-id.ts` | Server + Client |
| **前端 API** | `client-api.ts`, `client-auth.ts` | Client |
| **Route 共用** | `api.ts`, `env.ts` | Server |
| **qB** | `qbittorrent.ts` | Server（唯一打 qB 的模組） |
| **UI** | `i18n.ts`, `theme.ts`, `types.ts`, `format.ts` | 多為 Client |
| **開發** | `dev/preview.ts` | Server（dev only） |

---

## 關鍵檔案速查

| 想改… | 檔案 |
|-------|------|
| 登入流程 | `components/WebApp.tsx`, `lib/google-session.ts` |
| 下載 UI | `components/QbDashboard.tsx` |
| API 路由 | `app/api/qb/*/route.ts` |
| qB 連線 | `lib/qbittorrent.ts` |
| 文案 | `lib/i18n.ts` |
| 假資料預覽 | `lib/dev/preview.ts` |
| Deploy | `.github/workflows/deploy-cloudflare.yml` |
