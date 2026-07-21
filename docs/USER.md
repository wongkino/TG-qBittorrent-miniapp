# 使用手冊（User）

給實際使用 Web App／Bot 的人。部署與變數請看 [DEPLOY.md](DEPLOY.md)。

## 第一次使用

### Web App

1. 管理員完成 Deploy，並把你的 Google email 加入 `ALLOWED_GOOGLE_EMAILS`
2. 瀏覽器開啟 Workers URL（或 Bot 左側「開啟 App」）
3. 點 **Google 登入**，使用白名單內的帳號
4. （可選）Safari：**分享 → 加入主畫面**，可全螢幕使用

### Telegram Bot

1. 管理員把你的 Telegram User ID 加入 `ALLOWED_TELEGRAM_USER_IDS`
2. 在 Telegram 打開 Bot
3. 下方應有鍵盤：**狀態**／**列表**／**說明**（文案跟 Web App 語系）
4. 在 Web App 內切換語系後，Bot 也會跟著變

若沒有左側按鈕或鍵盤：傳任意訊息給 Bot（或請管理員重跑 Deploy）。

---

## Web App

### 登入
- 使用 **Google 帳號**登入；僅白名單 email 可存取
- 登入狀態會記住；若 token 過期需重新登入

### 語系與外觀
- **語系**：右上角 **EN／繁／简／日** 點開選單選擇（會記住；Bot 回覆與通知也跟此語系）
- **日間／夜間**：旁邊太陽／月亮圖示切換（會記住）

### 下載
- 進入後自動列出種子，約每 4 秒更新
- 右上角重整圖示可手動更新
- 可排序（加入時間、名稱、進度、速度、大小、ETA）；箭頭圖示切升降序

### RSS
1. 切到 **RSS** 分頁  
2. 貼上 feed 網址（可選填名稱）後新增  
3. 選左側訂閱 → 可重新整理／移除  
4. 文章列按「加入」→ 送到 qBittorrent（可先選「加入時分類」）

說明：資料來自 qBittorrent 內建 RSS；自動下載規則尚未提供。

### 加下載（手動）
1. 在 **下載** 分頁貼上 magnet 或 torrent 網址  
2. （可選）選分類  
3. 送出  

也可用「貼上」從剪貼簿帶入。

> Web App **不能**選本機 `.torrent` 檔。請改傳檔案給 Bot。

### 單筆操作
每一列可：暫停／繼續、改分類、移除（只刪任務）、刪檔（連檔案，會再確認）。

### 批次
1. 點 checklist 圖示進入選取模式  
2. 勾選多筆  
3. 暫停／繼續／移除／刪檔  
4. 勾選圖示結束選取  

---

## Bot

### 鍵盤按鈕

| 按鈕 | 作用 |
|------|------|
| 狀態 | 總數、下載中／做種／暫停、總上下載速度 |
| 列表 | 最多 15 筆進行中種子 |
| 說明 | 使用說明 |

仍可輸入 `/start`、`/status`、`/list`、`/help`（效果相同）。

Bot 文案與鍵盤跟 **Web App 目前語系**（在 App 內切換後會同步；需先開啟過 App）。

### 加種方式
- 直接傳 **magnet** 或 **torrent URL** 文字
- 傳 **`.torrent` 檔案**

成功會回「已加入…」。

### 左側「開啟 App」
開啟同一個 Web App 網頁（Workers URL）。

---

## 通知

| 通知 | 何時 |
|------|------|
| ⬇️ 下載開始 | 新種子加入後約 0–5 分鐘內（Cloudflare Cron） |
| ✅ 下載完成 | 完成後約 0–5 分鐘內 |

注意：

- 透過 Bot 加種時，會先有「已加入」，之後可能再收到「下載開始」
- 超過約 15 分鐘才被系統掃到的事件可能不再通知
- 通知只會寄給白名單內的 Telegram 帳號

---

## 常見狀況

**Web App 顯示未授權**  
Google email 不在白名單，請管理員把 email 加入 `ALLOWED_GOOGLE_EMAILS` 並重新 Deploy。

**Bot 顯示未授權**  
Telegram ID 不在白名單，請管理員把 ID 加入 `ALLOWED_TELEGRAM_USER_IDS` 並重新 Deploy。

**登入按鈕沒出現**  
管理員需設定 `GOOGLE_CLIENT_ID`；Google Cloud Console 的 Authorized JavaScript origins 需包含 Workers URL。

**點了沒反應／列表空的**  
qBittorrent 可能連不上，或帳密／URL 錯誤；請管理員查日誌。

**沒有開始／完成通知**  
確認 Cloudflare Worker Cron（`*/5 * * * *`）、`CRON_SECRET`、Telegram 白名單；可手動 `POST /api/cron/completions` 測試。

**介面語言不對**  
點右上角 **EN／繁／简／日** 切換即可。

**誤刪檔案**  
「刪檔」會連下載檔一起刪；只要從列表拿掉請用「移除」。
