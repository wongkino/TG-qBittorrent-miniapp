# 環境變數範本（dev / prod 分開）

| 檔案 | 複製到 | 用途 |
|------|--------|------|
| [`development.example`](development.example) | `.env.development.local` | `npm run dev`（Next 本機） |
| [`production.example`](production.example) | （勿複製進 repo 執行檔） | 對照 GitHub／Cloudflare **正式** secrets |
| [`wrangler.development.example`](wrangler.development.example) | `.dev.vars` | `npm run preview`／本機 wrangler |

## 本機（dev）

```bash
cp env/development.example .env.development.local
npm install
npm run dev
```

預設開啟 UI 預覽（`DEV_PREVIEW`）；不需 Telegram／qB。

真機聯調時：在 `.env.development.local` 關掉 `DEV_PREVIEW`／`NEXT_PUBLIC_DEV_PREVIEW`，並填 bot／qB。

## 正式（prod）

變數放在 **GitHub Secrets／Variables** 與 **Cloudflare Worker Secrets**（Deploy 自動同步），**不要**把 production secrets 寫進 `.env.production.local` 後提交。

對照表見 [`production.example`](production.example) 與 [docs/DEPLOY.md](../docs/DEPLOY.md)。

`APP_URL` 只是 GitHub Variable，**不會**進 Worker runtime。
