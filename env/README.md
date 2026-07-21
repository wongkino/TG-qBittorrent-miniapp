# 環境變數範本

`.example` 檔案放此目錄；**說明文件**在 [`docs/reference/environment.md`](../docs/reference/environment.md)。

```bash
cp env/development.example .env.development.local   # npm run dev
cp env/wrangler.development.example .dev.vars       # npm run preview
```

| 檔案 | 用途 |
|------|------|
| `development.example` | 本機 Next.js |
| `wrangler.development.example` | Wrangler preview |
| `production.example` | 正式環境對照（勿提交真值） |
