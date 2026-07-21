# qBittorrent Web App

個人 Web App（Google 登入、PWA），經 Cloudflare Workers 代理 qBittorrent。

```bash
cp env/development.example .env.development.local
npm install && npm run dev
```

→ http://localhost:3000

---

## 文件

**索引**：[`docs/README.md`](docs/README.md) · **AI**：[AGENTS.md](AGENTS.md)

| | |
|--|--|
| 使用者 | [docs/guides/user.md](docs/guides/user.md) |
| 開發 | [docs/guides/development.md](docs/guides/development.md) |
| 部署 | [docs/guides/deployment.md](docs/guides/deployment.md) |
| 架構 | [docs/architecture/overview.md](docs/architecture/overview.md) |
| API | [docs/reference/api-routes.md](docs/reference/api-routes.md) |
| 環境變數 | [docs/reference/environment.md](docs/reference/environment.md) |

範本檔：`env/*.example`

---

## 功能

Google 登入 · 下載管理 · RSS · 四語 · 日間／夜間 · PWA
