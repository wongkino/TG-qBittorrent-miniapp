# 文件地圖

本 repo 所有說明文件集中在 `docs/`。**AI agent 請先讀根目錄 [`AGENTS.md`](../AGENTS.md)**。

## 目錄結構

```
docs/
├── README.md                 ← 你在這裡（總索引）
├── architecture/             系統設計、程式目錄
├── guides/                   操作手冊（使用者／開發／部署）
├── reference/                查表用（API、環境變數）
└── ai/                       AI 任務指引與閱讀順序
```

## 依角色

| 角色 | 入口 |
|------|------|
| **AI／Cursor** | [AGENTS.md](../AGENTS.md) → [ai/README.md](ai/README.md) |
| **開發者** | [architecture/overview.md](architecture/overview.md) → [guides/development.md](guides/development.md) |
| **部署** | [guides/deployment.md](guides/deployment.md) → [reference/environment.md](reference/environment.md) |
| **使用者** | [guides/user.md](guides/user.md) |

## 全部文件

### architecture/

| 文件 | 內容 |
|------|------|
| [overview.md](architecture/overview.md) | 分層、技術棧、認證、狀態、能力邊界 |
| [codebase.md](architecture/codebase.md) | 完整目錄樹、元件／lib 分組 |

### guides/

| 文件 | 內容 |
|------|------|
| [user.md](guides/user.md) | Web App 使用手冊 |
| [development.md](guides/development.md) | 本機開發、scripts、擴充流程 |
| [deployment.md](guides/deployment.md) | Cloudflare Deploy、驗證、故障排除 |

### reference/

| 文件 | 內容 |
|------|------|
| [api-routes.md](reference/api-routes.md) | `/api/qb/*` 對照表 |
| [environment.md](reference/environment.md) | 環境變數完整說明 |

### ai/

| 文件 | 內容 |
|------|------|
| [README.md](ai/README.md) | Agent 閱讀順序與約束摘要 |
| [tasks.md](ai/tasks.md) | 常見任務步驟（加功能、改 UI、部署） |

### 根目錄

| 文件 | 內容 |
|------|------|
| [../README.md](../README.md) | 專案總覽、快速開始 |
| [../AGENTS.md](../AGENTS.md) | AI 開發約束（Cursor 自動載入） |
| [../env/](../env/) | 環境變數 `.example` 範本檔（非說明文件） |
