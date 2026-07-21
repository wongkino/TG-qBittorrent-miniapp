# 使用手冊（User）

部署與環境變數見 [DEPLOY.md](DEPLOY.md)。技術架構見 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 第一次使用

1. 管理員完成 Deploy，並把你的 Google email 加入 `ALLOWED_GOOGLE_EMAILS`
2. 瀏覽器開啟 Workers URL
3. 點 **Google 登入**，使用白名單內的帳號
4. （可選）Safari：**分享 → 加入主畫面**，可全螢幕使用

---

## Web App

### 登入
- 使用 **Google 帳號**登入；僅白名單 email 可存取
- 登入狀態會記住；若 token 過期需重新登入

### 語系與外觀
- **語系**：右上角 **EN／繁／简／日** 點開選單選擇（會記住）
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

### 單筆操作
每一列可：暫停／繼續、改分類、移除（只刪任務）、刪檔（連檔案，會再確認）。

### 批次
1. 點 checklist 圖示進入選取模式  
2. 勾選多筆  
3. 暫停／繼續／移除／刪檔  
4. 勾選圖示結束選取  

---

## 常見狀況

**顯示未授權**  
Google email 不在白名單，請管理員把 email 加入 `ALLOWED_GOOGLE_EMAILS` 並重新 Deploy。

**登入按鈕沒出現**  
管理員需設定 `GOOGLE_CLIENT_ID`；Google Cloud Console 的 Authorized JavaScript origins 需包含 Workers URL。

**點了沒反應／列表空的**  
qBittorrent 可能連不上，或帳密／URL 錯誤；請管理員查日誌。

**介面語言不對**  
點右上角 **EN／繁／简／日** 切換即可。

**誤刪檔案**  
「刪檔」會連下載檔一起刪；只要從列表拿掉請用「移除」。
