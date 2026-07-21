# 文件索引

## 依角色閱讀

| 你是… | 從這裡開始 |
|--------|------------|
| **使用者** | [USER.md](USER.md) — 登入、下載、RSS、常見問題 |
| **部署／維運** | [DEPLOY.md](DEPLOY.md) — GitHub Secrets、Cloudflare Deploy |
| **開發者** | [ARCHITECTURE.md](ARCHITECTURE.md) — 目錄、分層、API |
| **本機開發** | [DEVELOPMENT.md](DEVELOPMENT.md) — env、scripts、擴充方式 |
| **AI／Cursor** | [../AGENTS.md](../AGENTS.md) — 程式邊界與約束 |

## 全部文件

| 文件 | 內容 |
|------|------|
| [USER.md](USER.md) | Web App 操作手冊 |
| [DEPLOY.md](DEPLOY.md) | 上線部署與故障排除 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 架構、目錄結構、請求流、認證 |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 本機開發與程式慣例 |
| [../env/README.md](../env/README.md) | 環境變數範本說明 |
| [../README.md](../README.md) | 專案總覽、快速開始、變數總表 |
| [../AGENTS.md](../AGENTS.md) | Agent 開發約束 |

## 建議順序（開發）

1. [ARCHITECTURE.md](ARCHITECTURE.md) — 弄清分層與目錄  
2. [DEVELOPMENT.md](DEVELOPMENT.md) — 跑起本機  
3. [../env/README.md](../env/README.md) — 設環境變數  
4. 原始碼：`lib/qbittorrent.ts` → `lib/client-api.ts` → `components/QbDashboard.tsx`
