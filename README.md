# qBittorrent Web App

個人專用 Web App（Google 登入、PWA／iOS 主畫面），經 **Cloudflare Workers**（OpenNext）代理 **qBittorrent Web API**。

| | |
|--|--|
| Worker | `tg-dl` |
| 認證 | Google OAuth + email 白名單 |
| 語系 | 英／繁中／簡中／日文 |
| 分頁 | 下載、RSS |

---

## 快速開始

```bash
cp env/development.example .env.development.local
npm install
npm run dev
```

→ http://localhost:3000（預設 `DEV_PREVIEW` 假資料模式）

上線：填 GitHub Secrets／Variables → push `main` 或手動 Deploy → 見 [docs/DEPLOY.md](docs/DEPLOY.md)。

---

## 文件

| 文件 | 對象 |
|------|------|
| [docs/USER.md](docs/USER.md) | 使用者 |
| [docs/DEPLOY.md](docs/DEPLOY.md) | 部署 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 架構與目錄 |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | 本機開發 |
| [docs/README.md](docs/README.md) | 文件索引 |
| [env/README.md](env/README.md) | 環境變數 |
| [AGENTS.md](AGENTS.md) | AI／Cursor |

---

## 環境變數

| 變數 | 本機 `.env.development.local` | `.dev.vars` | Worker Secret | GitHub Secret | GitHub Variable |
|------|:---:|:---:|:---:|:---:|:---:|
| `QBITTORRENT_URL` | 可選 | ✅ | ✅ | | ✅ |
| `QBITTORRENT_USERNAME` | 可選 | ✅ | ✅ | ✅ | |
| `QBITTORRENT_PASSWORD` | 可選 | ✅ | ✅ | ✅ | |
| `GOOGLE_CLIENT_ID` | 可選 | ✅ | ✅ | | ✅ |
| `ALLOWED_GOOGLE_EMAILS` | 可選 | ✅ | ✅ | | ✅ |
| `DEV_PREVIEW` / `NEXT_PUBLIC_DEV_PREVIEW` | dev | — | — | | |
| `CLOUDFLARE_API_TOKEN` | | | | ✅ | |
| `CLOUDFLARE_ACCOUNT_ID` | | | | ✅ | |
| `NEXTJS_ENV` | | ✅ | | | |

細節見 [env/production.example](env/production.example)。

---

## 授權

僅供 `ALLOWED_GOOGLE_EMAILS` 白名單內帳號使用；請自行保管 qB 帳密與 OAuth 設定。
