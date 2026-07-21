export type Locale = "zh-Hant" | "zh-Hans" | "en" | "ja";

export type MessageKey = keyof typeof zhHant;

const zhHant = {
  "app.loading": "載入中…",
  "app.hello": "你好，{name}",
  "app.unauthorized": "未授權",
  "app.nav": "主選單",
  "app.tab.downloads": "下載",
  "app.tab.rss": "RSS",
  "app.refresh": "重新整理",
  "app.refreshFailed": "重新整理失敗",
  "app.actionFailed": "操作失敗",
  "app.initFailed": "初始化失敗",
  "app.previewUser": "本機預覽",
  "app.previewInitFailed": "本機預覽初始化失敗",
  "app.noInitData":
    "無法取得 Telegram initData。請從 Telegram Bot 內開啟此 Mini App。",

  "theme.toLight": "日間",
  "theme.toDark": "夜間",
  "theme.switchToLight": "切換日間模式",
  "theme.switchToDark": "切換夜間模式",

  "sort.label": "排序",
  "sort.added_on": "加入時間",
  "sort.name": "名稱",
  "sort.progress": "進度",
  "sort.dlspeed": "下載速度",
  "sort.upspeed": "上傳速度",
  "sort.size": "大小",
  "sort.eta": "ETA",
  "sort.desc": "降序",
  "sort.asc": "升序",

  "filter.label": "狀態",
  "filter.all": "全部",
  "filter.downloading": "下載中",
  "filter.paused": "暫停",
  "filter.completed": "完成",

  "batch.open": "批次",
  "batch.done": "完成選取",
  "batch.selected": "已選 {selected}/{total}",
  "batch.selectAll": "全選",
  "batch.clear": "清除",
  "batch.pause": "暫停",
  "batch.resume": "繼續",
  "batch.remove": "移除",
  "batch.deleteFiles": "刪檔",
  "batch.confirmRemove": "移除選取的 {count} 個種子（保留檔案）？",
  "batch.confirmDelete":
    "刪除選取的 {count} 個種子與檔案？此操作無法復原。",

  "list.empty": "目前沒有種子",
  "list.emptyHint": "用下方表單貼上 magnet，或傳 .torrent 給 Bot",
  "list.emptyFiltered": "沒有符合此狀態的種子",

  "torrent.progress": "進度 {progress}",
  "torrent.category": "分類",
  "torrent.resume": "繼續",
  "torrent.pause": "暫停",
  "torrent.remove": "移除",
  "torrent.deleteFiles": "刪檔",
  "torrent.confirmRemove": "只從列表移除，保留已下載檔案？",
  "torrent.confirmDelete": "刪除種子並刪除檔案？此操作無法復原。",

  "state.downloading": "下載中",
  "state.uploading": "做種中",
  "state.pausedDL": "已暫停",
  "state.pausedUP": "已暫停",
  "state.stoppedDL": "已停止",
  "state.stoppedUP": "已停止",
  "state.queuedDL": "排隊中",
  "state.queuedUP": "排隊做種",
  "state.stalledDL": "停滯",
  "state.stalledUP": "停滯做種",
  "state.checkingDL": "檢查中",
  "state.checkingUP": "檢查中",
  "state.checkingResumeData": "檢查中",
  "state.forcedDL": "強制下載",
  "state.forcedUP": "強制做種",
  "state.metaDL": "取得中繼資料",
  "state.moving": "移動中",
  "state.missingFiles": "缺少檔案",
  "state.error": "錯誤",
  "state.unknown": "未知",

  "add.title": "新增種子",
  "add.paste": "貼上",
  "add.pasting": "貼上中…",
  "add.placeholder": "magnet:?xt=... 或 https://.../*.torrent",
  "add.category": "下載分類",
  "add.noCategory": "無分類",
  "add.noCategoriesYet": "尚未建立分類",
  "add.submit": "新增",
  "add.submitting": "新增中…",
  "add.clipboardEmpty": "剪貼簿是空的",
  "add.clipboardFailed": "無法讀取剪貼簿",
  "add.pasteFailed": "貼上失敗",
  "add.failed": "新增失敗",

  "rss.intro":
    "管理 qBittorrent RSS 訂閱；可重新整理來源，並從文章直接加入下載。",
  "rss.urlPlaceholder": "RSS 網址 https://",
  "rss.namePlaceholder": "名稱（可選）",
  "rss.add": "新增",
  "rss.categoryOnAdd": "加入時分類",
  "rss.noCategory": "無分類",
  "rss.reloadList": "重整列表",
  "rss.loading": "載入 RSS…",
  "rss.empty": "尚未訂閱任何 RSS",
  "rss.emptyHint": "貼上 feed 網址後按新增",
  "rss.loadFailed": "無法載入 RSS",
  "rss.added": "已新增訂閱",
  "rss.refreshed": "已重新整理",
  "rss.removed": "已移除",
  "rss.addedDownload": "已加入下載",
  "rss.errorTag": " · 錯誤",
  "rss.loadingTag": " · 載入中",
  "rss.refresh": "重新整理",
  "rss.remove": "移除",
  "rss.confirmRemove": "移除訂閱「{name}」？",
  "rss.noArticles": "尚無文章（可按重新整理）",
  "rss.pickFeed": "選擇左側訂閱",
  "rss.join": "加入",

  "bot.btn.status": "狀態",
  "bot.btn.list": "列表",
  "bot.btn.help": "說明",
  "bot.start": "👋 已連線到 qBittorrent Mini App Bot。",
  "bot.unauthorized": "未授權使用此 Bot。",
  "bot.helpTitle": "可用操作",
  "bot.helpStatus": "目前下載狀態",
  "bot.helpList": "列出進行中的種子",
  "bot.helpHelp": "顯示說明",
  "bot.helpAlso": "也可直接傳：",
  "bot.helpMagnet": "• magnet / .torrent 連結文字",
  "bot.helpFile": "• .torrent 檔案",
  "bot.statusTitle": "qBittorrent 狀態",
  "bot.statusTotal": "總數：{count}",
  "bot.statusDownloading": "下載中：{count}",
  "bot.statusSeeding": "做種中：{count}",
  "bot.statusPaused": "已暫停：{count}",
  "bot.statusActive": "活躍：{count}",
  "bot.listTitle": "進行中",
  "bot.listEmpty": "目前沒有進行中的種子。",
  "bot.addedUrl": "已加入：\n<code>{url}</code>",
  "bot.addedFile": "已加入種子檔：\n<code>{name}</code>",
  "bot.needTorrent": "請傳送 .torrent 檔案。",
  "bot.unknown": "未知指令。",
  "bot.notifyStart": "⬇️ <b>下載開始</b>",
  "bot.notifyDone": "✅ <b>下載完成</b>",
  "bot.notifySize": "大小：{size}",
  "bot.notifyCategory": "分類：{category}",
} as const;

const zhHans: Record<MessageKey, string> = {
  "app.loading": "加载中…",
  "app.hello": "你好，{name}",
  "app.unauthorized": "未授权",
  "app.nav": "主菜单",
  "app.tab.downloads": "下载",
  "app.tab.rss": "RSS",
  "app.refresh": "刷新",
  "app.refreshFailed": "刷新失败",
  "app.actionFailed": "操作失败",
  "app.initFailed": "初始化失败",
  "app.previewUser": "本地预览",
  "app.previewInitFailed": "本地预览初始化失败",
  "app.noInitData":
    "无法取得 Telegram initData。请从 Telegram Bot 内打开此 Mini App。",

  "theme.toLight": "日间",
  "theme.toDark": "夜间",
  "theme.switchToLight": "切换日间模式",
  "theme.switchToDark": "切换夜间模式",

  "sort.label": "排序",
  "sort.added_on": "加入时间",
  "sort.name": "名称",
  "sort.progress": "进度",
  "sort.dlspeed": "下载速度",
  "sort.upspeed": "上传速度",
  "sort.size": "大小",
  "sort.eta": "ETA",
  "sort.desc": "降序",
  "sort.asc": "升序",

  "filter.label": "状态",
  "filter.all": "全部",
  "filter.downloading": "下载中",
  "filter.paused": "暂停",
  "filter.completed": "完成",

  "batch.open": "批量",
  "batch.done": "完成选取",
  "batch.selected": "已选 {selected}/{total}",
  "batch.selectAll": "全选",
  "batch.clear": "清除",
  "batch.pause": "暂停",
  "batch.resume": "继续",
  "batch.remove": "移除",
  "batch.deleteFiles": "删档",
  "batch.confirmRemove": "移除选取的 {count} 个种子（保留文件）？",
  "batch.confirmDelete":
    "删除选取的 {count} 个种子与文件？此操作无法复原。",

  "list.empty": "目前没有种子",
  "list.emptyHint": "用下方表单粘贴 magnet，或传 .torrent 给 Bot",
  "list.emptyFiltered": "没有符合此状态的种子",

  "torrent.progress": "进度 {progress}",
  "torrent.category": "分类",
  "torrent.resume": "继续",
  "torrent.pause": "暂停",
  "torrent.remove": "移除",
  "torrent.deleteFiles": "删档",
  "torrent.confirmRemove": "只从列表移除，保留已下载文件？",
  "torrent.confirmDelete": "删除种子并删除文件？此操作无法复原。",

  "state.downloading": "下载中",
  "state.uploading": "做种中",
  "state.pausedDL": "已暂停",
  "state.pausedUP": "已暂停",
  "state.stoppedDL": "已停止",
  "state.stoppedUP": "已停止",
  "state.queuedDL": "排队中",
  "state.queuedUP": "排队做种",
  "state.stalledDL": "停滞",
  "state.stalledUP": "停滞做种",
  "state.checkingDL": "检查中",
  "state.checkingUP": "检查中",
  "state.checkingResumeData": "检查中",
  "state.forcedDL": "强制下载",
  "state.forcedUP": "强制做种",
  "state.metaDL": "取得元数据",
  "state.moving": "移动中",
  "state.missingFiles": "缺少文件",
  "state.error": "错误",
  "state.unknown": "未知",

  "add.title": "新增种子",
  "add.paste": "粘贴",
  "add.pasting": "粘贴中…",
  "add.placeholder": "magnet:?xt=... 或 https://.../*.torrent",
  "add.category": "下载分类",
  "add.noCategory": "无分类",
  "add.noCategoriesYet": "尚未建立分类",
  "add.submit": "新增",
  "add.submitting": "新增中…",
  "add.clipboardEmpty": "剪贴板是空的",
  "add.clipboardFailed": "无法读取剪贴板",
  "add.pasteFailed": "粘贴失败",
  "add.failed": "新增失败",

  "rss.intro":
    "管理 qBittorrent RSS 订阅；可刷新来源，并从文章直接加入下载。",
  "rss.urlPlaceholder": "RSS 网址 https://",
  "rss.namePlaceholder": "名称（可选）",
  "rss.add": "新增",
  "rss.categoryOnAdd": "加入时分类",
  "rss.noCategory": "无分类",
  "rss.reloadList": "重整列表",
  "rss.loading": "加载 RSS…",
  "rss.empty": "尚未订阅任何 RSS",
  "rss.emptyHint": "粘贴 feed 网址后按新增",
  "rss.loadFailed": "无法加载 RSS",
  "rss.added": "已新增订阅",
  "rss.refreshed": "已刷新",
  "rss.removed": "已移除",
  "rss.addedDownload": "已加入下载",
  "rss.errorTag": " · 错误",
  "rss.loadingTag": " · 加载中",
  "rss.refresh": "刷新",
  "rss.remove": "移除",
  "rss.confirmRemove": "移除订阅「{name}」？",
  "rss.noArticles": "尚无文章（可按刷新）",
  "rss.pickFeed": "选择左侧订阅",
  "rss.join": "加入",

  "bot.btn.status": "状态",
  "bot.btn.list": "列表",
  "bot.btn.help": "说明",
  "bot.start": "👋 已连接到 qBittorrent Mini App Bot。",
  "bot.unauthorized": "未授权使用此 Bot。",
  "bot.helpTitle": "可用操作",
  "bot.helpStatus": "目前下载状态",
  "bot.helpList": "列出进行中的种子",
  "bot.helpHelp": "显示说明",
  "bot.helpAlso": "也可直接传：",
  "bot.helpMagnet": "• magnet / .torrent 链接文字",
  "bot.helpFile": "• .torrent 文件",
  "bot.statusTitle": "qBittorrent 状态",
  "bot.statusTotal": "总数：{count}",
  "bot.statusDownloading": "下载中：{count}",
  "bot.statusSeeding": "做种中：{count}",
  "bot.statusPaused": "已暂停：{count}",
  "bot.statusActive": "活跃：{count}",
  "bot.listTitle": "进行中",
  "bot.listEmpty": "目前没有进行中的种子。",
  "bot.addedUrl": "已加入：\n<code>{url}</code>",
  "bot.addedFile": "已加入种子文件：\n<code>{name}</code>",
  "bot.needTorrent": "请传送 .torrent 文件。",
  "bot.unknown": "未知指令。",
  "bot.notifyStart": "⬇️ <b>下载开始</b>",
  "bot.notifyDone": "✅ <b>下载完成</b>",
  "bot.notifySize": "大小：{size}",
  "bot.notifyCategory": "分类：{category}",
};

const en: Record<MessageKey, string> = {
  "app.loading": "Loading…",
  "app.hello": "Hi, {name}",
  "app.unauthorized": "Unauthorized",
  "app.nav": "Main menu",
  "app.tab.downloads": "Downloads",
  "app.tab.rss": "RSS",
  "app.refresh": "Refresh",
  "app.refreshFailed": "Refresh failed",
  "app.actionFailed": "Action failed",
  "app.initFailed": "Initialization failed",
  "app.previewUser": "Local preview",
  "app.previewInitFailed": "Local preview failed to start",
  "app.noInitData":
    "Missing Telegram initData. Open this Mini App from the Telegram Bot.",

  "theme.toLight": "Light",
  "theme.toDark": "Dark",
  "theme.switchToLight": "Switch to light mode",
  "theme.switchToDark": "Switch to dark mode",

  "sort.label": "Sort",
  "sort.added_on": "Added",
  "sort.name": "Name",
  "sort.progress": "Progress",
  "sort.dlspeed": "Download speed",
  "sort.upspeed": "Upload speed",
  "sort.size": "Size",
  "sort.eta": "ETA",
  "sort.desc": "Descending",
  "sort.asc": "Ascending",

  "filter.label": "Status",
  "filter.all": "All",
  "filter.downloading": "Downloading",
  "filter.paused": "Paused",
  "filter.completed": "Completed",

  "batch.open": "Batch",
  "batch.done": "Done",
  "batch.selected": "Selected {selected}/{total}",
  "batch.selectAll": "Select all",
  "batch.clear": "Clear",
  "batch.pause": "Pause",
  "batch.resume": "Resume",
  "batch.remove": "Remove",
  "batch.deleteFiles": "Delete files",
  "batch.confirmRemove":
    "Remove {count} selected torrents (keep files)?",
  "batch.confirmDelete":
    "Delete {count} selected torrents and files? This cannot be undone.",

  "list.empty": "No torrents yet",
  "list.emptyHint":
    "Paste a magnet below, or send a .torrent file to the Bot",
  "list.emptyFiltered": "No torrents match this status",

  "torrent.progress": "Progress {progress}",
  "torrent.category": "Category",
  "torrent.resume": "Resume",
  "torrent.pause": "Pause",
  "torrent.remove": "Remove",
  "torrent.deleteFiles": "Delete files",
  "torrent.confirmRemove":
    "Remove from the list only and keep downloaded files?",
  "torrent.confirmDelete":
    "Delete the torrent and its files? This cannot be undone.",

  "state.downloading": "Downloading",
  "state.uploading": "Seeding",
  "state.pausedDL": "Paused",
  "state.pausedUP": "Paused",
  "state.stoppedDL": "Stopped",
  "state.stoppedUP": "Stopped",
  "state.queuedDL": "Queued",
  "state.queuedUP": "Queued seeding",
  "state.stalledDL": "Stalled",
  "state.stalledUP": "Stalled seeding",
  "state.checkingDL": "Checking",
  "state.checkingUP": "Checking",
  "state.checkingResumeData": "Checking",
  "state.forcedDL": "Forced download",
  "state.forcedUP": "Forced seeding",
  "state.metaDL": "Fetching metadata",
  "state.moving": "Moving",
  "state.missingFiles": "Missing files",
  "state.error": "Error",
  "state.unknown": "Unknown",

  "add.title": "Add torrent",
  "add.paste": "Paste",
  "add.pasting": "Pasting…",
  "add.placeholder": "magnet:?xt=... or https://.../*.torrent",
  "add.category": "Category",
  "add.noCategory": "None",
  "add.noCategoriesYet": "No categories yet",
  "add.submit": "Add",
  "add.submitting": "Adding…",
  "add.clipboardEmpty": "Clipboard is empty",
  "add.clipboardFailed": "Could not read clipboard",
  "add.pasteFailed": "Paste failed",
  "add.failed": "Failed to add",

  "rss.intro":
    "Manage qBittorrent RSS feeds; refresh sources and add articles to download.",
  "rss.urlPlaceholder": "RSS URL https://",
  "rss.namePlaceholder": "Name (optional)",
  "rss.add": "Add",
  "rss.categoryOnAdd": "Category when adding",
  "rss.noCategory": "None",
  "rss.reloadList": "Reload list",
  "rss.loading": "Loading RSS…",
  "rss.empty": "No RSS feeds yet",
  "rss.emptyHint": "Paste a feed URL and tap Add",
  "rss.loadFailed": "Failed to load RSS",
  "rss.added": "Feed added",
  "rss.refreshed": "Refreshed",
  "rss.removed": "Removed",
  "rss.addedDownload": "Added to downloads",
  "rss.errorTag": " · error",
  "rss.loadingTag": " · loading",
  "rss.refresh": "Refresh",
  "rss.remove": "Remove",
  "rss.confirmRemove": "Remove feed “{name}”?",
  "rss.noArticles": "No articles yet (try Refresh)",
  "rss.pickFeed": "Select a feed",
  "rss.join": "Add",

  "bot.btn.status": "Status",
  "bot.btn.list": "List",
  "bot.btn.help": "Help",
  "bot.start": "👋 Connected to the qBittorrent Mini App Bot.",
  "bot.unauthorized": "You are not authorized to use this bot.",
  "bot.helpTitle": "Available actions",
  "bot.helpStatus": "Current download status",
  "bot.helpList": "List active torrents",
  "bot.helpHelp": "Show help",
  "bot.helpAlso": "You can also send:",
  "bot.helpMagnet": "• magnet / .torrent URL text",
  "bot.helpFile": "• a .torrent file",
  "bot.statusTitle": "qBittorrent status",
  "bot.statusTotal": "Total: {count}",
  "bot.statusDownloading": "Downloading: {count}",
  "bot.statusSeeding": "Seeding: {count}",
  "bot.statusPaused": "Paused: {count}",
  "bot.statusActive": "Active: {count}",
  "bot.listTitle": "Active",
  "bot.listEmpty": "No active torrents right now.",
  "bot.addedUrl": "Added:\n<code>{url}</code>",
  "bot.addedFile": "Added torrent file:\n<code>{name}</code>",
  "bot.needTorrent": "Please send a .torrent file.",
  "bot.unknown": "Unknown command.",
  "bot.notifyStart": "⬇️ <b>Download started</b>",
  "bot.notifyDone": "✅ <b>Download complete</b>",
  "bot.notifySize": "Size: {size}",
  "bot.notifyCategory": "Category: {category}",
};

const ja: Record<MessageKey, string> = {
  "app.loading": "読み込み中…",
  "app.hello": "こんにちは、{name}",
  "app.unauthorized": "未承認",
  "app.nav": "メインメニュー",
  "app.tab.downloads": "ダウンロード",
  "app.tab.rss": "RSS",
  "app.refresh": "更新",
  "app.refreshFailed": "更新に失敗しました",
  "app.actionFailed": "操作に失敗しました",
  "app.initFailed": "初期化に失敗しました",
  "app.previewUser": "ローカルプレビュー",
  "app.previewInitFailed": "ローカルプレビューの初期化に失敗しました",
  "app.noInitData":
    "Telegram initData を取得できません。Telegram Bot からこの Mini App を開いてください。",

  "theme.toLight": "ライト",
  "theme.toDark": "ダーク",
  "theme.switchToLight": "ライトモードに切り替え",
  "theme.switchToDark": "ダークモードに切り替え",

  "sort.label": "並べ替え",
  "sort.added_on": "追加日時",
  "sort.name": "名前",
  "sort.progress": "進捗",
  "sort.dlspeed": "ダウンロード速度",
  "sort.upspeed": "アップロード速度",
  "sort.size": "サイズ",
  "sort.eta": "ETA",
  "sort.desc": "降順",
  "sort.asc": "昇順",

  "filter.label": "状態",
  "filter.all": "すべて",
  "filter.downloading": "ダウンロード中",
  "filter.paused": "一時停止",
  "filter.completed": "完了",

  "batch.open": "一括",
  "batch.done": "選択完了",
  "batch.selected": "選択 {selected}/{total}",
  "batch.selectAll": "すべて選択",
  "batch.clear": "クリア",
  "batch.pause": "一時停止",
  "batch.resume": "再開",
  "batch.remove": "削除",
  "batch.deleteFiles": "ファイル削除",
  "batch.confirmRemove":
    "選択した {count} 件のトレントを削除しますか（ファイルは残す）？",
  "batch.confirmDelete":
    "選択した {count} 件のトレントとファイルを削除しますか？この操作は元に戻せません。",

  "list.empty": "トレントはありません",
  "list.emptyHint":
    "下のフォームに magnet を貼るか、.torrent を Bot に送ってください",
  "list.emptyFiltered": "この状態のトレントはありません",

  "torrent.progress": "進捗 {progress}",
  "torrent.category": "カテゴリ",
  "torrent.resume": "再開",
  "torrent.pause": "一時停止",
  "torrent.remove": "削除",
  "torrent.deleteFiles": "ファイル削除",
  "torrent.confirmRemove":
    "リストからのみ削除し、ダウンロード済みファイルは残しますか？",
  "torrent.confirmDelete":
    "トレントとファイルを削除しますか？この操作は元に戻せません。",

  "state.downloading": "ダウンロード中",
  "state.uploading": "シード中",
  "state.pausedDL": "一時停止",
  "state.pausedUP": "一時停止",
  "state.stoppedDL": "停止",
  "state.stoppedUP": "停止",
  "state.queuedDL": "待機中",
  "state.queuedUP": "シード待機",
  "state.stalledDL": "停滞",
  "state.stalledUP": "シード停滞",
  "state.checkingDL": "確認中",
  "state.checkingUP": "確認中",
  "state.checkingResumeData": "確認中",
  "state.forcedDL": "強制ダウンロード",
  "state.forcedUP": "強制シード",
  "state.metaDL": "メタデータ取得中",
  "state.moving": "移動中",
  "state.missingFiles": "ファイル不足",
  "state.error": "エラー",
  "state.unknown": "不明",

  "add.title": "トレントを追加",
  "add.paste": "貼り付け",
  "add.pasting": "貼り付け中…",
  "add.placeholder": "magnet:?xt=... または https://.../*.torrent",
  "add.category": "ダウンロードカテゴリ",
  "add.noCategory": "なし",
  "add.noCategoriesYet": "カテゴリ未作成",
  "add.submit": "追加",
  "add.submitting": "追加中…",
  "add.clipboardEmpty": "クリップボードが空です",
  "add.clipboardFailed": "クリップボードを読めません",
  "add.pasteFailed": "貼り付けに失敗しました",
  "add.failed": "追加に失敗しました",

  "rss.intro":
    "qBittorrent の RSS 購読を管理。ソースを更新し、記事から直接ダウンロードに追加できます。",
  "rss.urlPlaceholder": "RSS URL https://",
  "rss.namePlaceholder": "名前（任意）",
  "rss.add": "追加",
  "rss.categoryOnAdd": "追加時のカテゴリ",
  "rss.noCategory": "なし",
  "rss.reloadList": "一覧を再読込",
  "rss.loading": "RSS 読み込み中…",
  "rss.empty": "RSS 購読はまだありません",
  "rss.emptyHint": "フィード URL を貼って追加を押してください",
  "rss.loadFailed": "RSS を読み込めませんでした",
  "rss.added": "購読を追加しました",
  "rss.refreshed": "更新しました",
  "rss.removed": "削除しました",
  "rss.addedDownload": "ダウンロードに追加しました",
  "rss.errorTag": " · エラー",
  "rss.loadingTag": " · 読み込み中",
  "rss.refresh": "更新",
  "rss.remove": "削除",
  "rss.confirmRemove": "購読「{name}」を削除しますか？",
  "rss.noArticles": "記事がありません（更新を試してください）",
  "rss.pickFeed": "左側の購読を選択",
  "rss.join": "追加",

  "bot.btn.status": "状態",
  "bot.btn.list": "一覧",
  "bot.btn.help": "ヘルプ",
  "bot.start": "👋 qBittorrent Mini App Bot に接続しました。",
  "bot.unauthorized": "この Bot を使う権限がありません。",
  "bot.helpTitle": "できること",
  "bot.helpStatus": "現在のダウンロード状態",
  "bot.helpList": "進行中のトレントを一覧",
  "bot.helpHelp": "ヘルプを表示",
  "bot.helpAlso": "次も送れます：",
  "bot.helpMagnet": "• magnet / .torrent の URL テキスト",
  "bot.helpFile": "• .torrent ファイル",
  "bot.statusTitle": "qBittorrent 状態",
  "bot.statusTotal": "合計：{count}",
  "bot.statusDownloading": "ダウンロード中：{count}",
  "bot.statusSeeding": "シード中：{count}",
  "bot.statusPaused": "一時停止：{count}",
  "bot.statusActive": "アクティブ：{count}",
  "bot.listTitle": "進行中",
  "bot.listEmpty": "進行中のトレントはありません。",
  "bot.addedUrl": "追加しました：\n<code>{url}</code>",
  "bot.addedFile": "トレントファイルを追加しました：\n<code>{name}</code>",
  "bot.needTorrent": ".torrent ファイルを送ってください。",
  "bot.unknown": "不明なコマンドです。",
  "bot.notifyStart": "⬇️ <b>ダウンロード開始</b>",
  "bot.notifyDone": "✅ <b>ダウンロード完了</b>",
  "bot.notifySize": "サイズ：{size}",
  "bot.notifyCategory": "カテゴリ：{category}",
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  "zh-Hant": zhHant,
  "zh-Hans": zhHans,
  en,
  ja,
};

export const DEFAULT_LOCALE: Locale = "zh-Hant";

export const LOCALES: Locale[] = ["en", "zh-Hant", "zh-Hans", "ja"];

export const LOCALE_STORAGE_KEY = "tg-dl-locale";

export const LOCALE_SHORT_LABEL: Record<Locale, string> = {
  en: "EN",
  "zh-Hant": "繁",
  "zh-Hans": "简",
  ja: "日",
};

export const LOCALE_NATIVE_LABEL: Record<Locale, string> = {
  en: "English",
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文",
  ja: "日本語",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function readStoredLocale(): Locale | null {
  try {
    const value = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(value) ? value : null;
  } catch {
    return null;
  }
}

export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? DEFAULT_LOCALE;
}

export function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

/** Normalize loose tags to a Locale (legacy / rare callers). */
export function resolveLocale(languageCode?: string | null): Locale {
  if (isLocale(languageCode)) return languageCode;
  if (!languageCode?.trim()) return DEFAULT_LOCALE;
  const code = languageCode.trim().toLowerCase().replace(/_/g, "-");

  if (
    code.startsWith("zh-hant") ||
    code.startsWith("zh-tw") ||
    code.startsWith("zh-hk") ||
    code.startsWith("zh-mo")
  ) {
    return "zh-Hant";
  }
  if (code === "ja" || code.startsWith("ja-")) return "ja";
  if (code === "en" || code.startsWith("en-")) return "en";
  if (code === "zh" || code.startsWith("zh")) return "zh-Hans";
  return "en";
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  let text = messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function stateMessageKey(state: string): MessageKey | null {
  const key = `state.${state}` as MessageKey;
  return key in zhHant ? key : null;
}
