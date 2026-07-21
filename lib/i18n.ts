export type Locale = "zh-Hant" | "zh-Hans" | "en" | "ja";

export type MessageKey = keyof typeof zhHant;

const zhHant = {
  "app.loading": "載入中…",
  "app.loadingHint": "請稍候",
  "app.hello": "你好，{name}",
  "app.nav": "主選單",
  "app.tab.downloads": "下載",
  "app.tab.rss": "RSS",
  "app.tab.more": "更多",
  "app.refresh": "重新整理",
  "app.refreshFailed": "重新整理失敗",
  "app.pullToRefresh": "下拉重新整理",
  "app.refreshing": "重新整理中…",
  "app.actionFailed": "操作失敗",
  "app.previewUser": "本機預覽",

  "sheet.close": "關閉",
  "sheet.done": "完成",
  "more.title": "更多",
  "more.appearance": "外觀與語言",

  "pwa.installTitle": "加到主畫面",
  "pwa.installHint": "安裝後可像 App 一樣全螢幕使用。",
  "pwa.installHintIos": "Safari：分享 → 加入主畫面",
  "pwa.installAction": "安裝",
  "pwa.installDismiss": "稍後",
  "pwa.offlineTitle": "目前離線",
  "pwa.offlineHint": "恢復連線後下拉重新整理",
  "pwa.offlineBanner": "離線中 — 下拉可重試",

  "signIn.title": "qBittorrent Web App",
  "signIn.hintStandalone":
    "使用 Google 帳號登入。僅白名單內的 email 可連線 qBittorrent。",
  "signIn.hintBrowser":
    "使用 Google 帳號登入以存取 qBittorrent（需白名單 email）。",
  "signIn.failed": "Google 登入失敗，請確認帳號是否在白名單內",
  "signIn.missingClientId": "未設定 GOOGLE_CLIENT_ID，無法顯示登入按鈕",
  "signIn.footer":
    "在 Safari 分享 → 加入主畫面，即可像 App 一樣全螢幕使用。",

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
  "list.emptyHint": "點右下角 ＋ 貼上 magnet 或 torrent 網址",
  "list.emptyFiltered": "沒有符合此狀態的種子",
  "list.options": "列表選項",
  "list.sortSection": "排序",
  "list.batchSection": "批次",
  "rss.back": "返回",
  "rss.feedsSection": "訂閱",
  "rss.articlesSection": "文章",

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
  "add.fab": "新增種子",
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
} as const;

const zhHans: Record<MessageKey, string> = {
  "app.loading": "加载中…",
  "app.loadingHint": "请稍候",
  "app.hello": "你好，{name}",
  "app.nav": "主菜单",
  "app.tab.downloads": "下载",
  "app.tab.rss": "RSS",
  "app.tab.more": "更多",
  "app.refresh": "刷新",
  "app.refreshFailed": "刷新失败",
  "app.pullToRefresh": "下拉刷新",
  "app.refreshing": "刷新中…",
  "app.actionFailed": "操作失败",
  "app.previewUser": "本地预览",

  "sheet.close": "关闭",
  "sheet.done": "完成",
  "more.title": "更多",
  "more.appearance": "外观与语言",

  "pwa.installTitle": "添加到主屏幕",
  "pwa.installHint": "安装后可像 App 一样全屏使用。",
  "pwa.installHintIos": "Safari：分享 → 添加到主屏幕",
  "pwa.installAction": "安装",
  "pwa.installDismiss": "稍后",
  "pwa.offlineTitle": "当前离线",
  "pwa.offlineHint": "恢复连接后下拉刷新",
  "pwa.offlineBanner": "离线中 — 下拉可重试",

  "signIn.title": "qBittorrent Web App",
  "signIn.hintStandalone":
    "使用 Google 账号登录。仅白名单内的 email 可连接 qBittorrent。",
  "signIn.hintBrowser":
    "使用 Google 账号登录以访问 qBittorrent（需白名单 email）。",
  "signIn.failed": "Google 登录失败，请确认账号是否在白名单内",
  "signIn.missingClientId": "未设置 GOOGLE_CLIENT_ID，无法显示登录按钮",
  "signIn.footer":
    "在 Safari 分享 → 加入主画面，即可像 App 一样全屏使用。",

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
  "list.emptyHint": "点右下角 ＋ 粘贴 magnet 或 torrent 网址",
  "list.emptyFiltered": "没有符合此状态的种子",
  "list.options": "列表选项",
  "list.sortSection": "排序",
  "list.batchSection": "批量",
  "rss.back": "返回",
  "rss.feedsSection": "订阅",
  "rss.articlesSection": "文章",

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
  "add.fab": "新增种子",
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
};

const en: Record<MessageKey, string> = {
  "app.loading": "Loading…",
  "app.loadingHint": "Just a moment",
  "app.hello": "Hi, {name}",
  "app.nav": "Main menu",
  "app.tab.downloads": "Downloads",
  "app.tab.rss": "RSS",
  "app.tab.more": "More",
  "app.refresh": "Refresh",
  "app.refreshFailed": "Refresh failed",
  "app.pullToRefresh": "Pull to refresh",
  "app.refreshing": "Refreshing…",
  "app.actionFailed": "Action failed",
  "app.previewUser": "Local preview",

  "sheet.close": "Close",
  "sheet.done": "Done",
  "more.title": "More",
  "more.appearance": "Appearance & language",

  "pwa.installTitle": "Add to Home Screen",
  "pwa.installHint": "Install for a full-screen app experience.",
  "pwa.installHintIos": "Safari: Share → Add to Home Screen",
  "pwa.installAction": "Install",
  "pwa.installDismiss": "Not now",
  "pwa.offlineTitle": "You’re offline",
  "pwa.offlineHint": "When back online, pull to refresh",
  "pwa.offlineBanner": "Offline — pull to retry",

  "signIn.title": "qBittorrent Web App",
  "signIn.hintStandalone":
    "Sign in with Google. Only whitelisted emails can connect to qBittorrent.",
  "signIn.hintBrowser":
    "Sign in with Google to access qBittorrent (whitelisted email required).",
  "signIn.failed":
    "Google sign-in failed. Check that your email is on the allow list.",
  "signIn.missingClientId":
    "GOOGLE_CLIENT_ID is not set; the sign-in button cannot be shown.",
  "signIn.footer":
    "In Safari: Share → Add to Home Screen for a full-screen app experience.",

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
  "list.emptyHint": "Tap ＋ to paste a magnet or torrent URL",
  "list.emptyFiltered": "No torrents match this status",
  "list.options": "List options",
  "list.sortSection": "Sort",
  "list.batchSection": "Batch",
  "rss.back": "Back",
  "rss.feedsSection": "Feeds",
  "rss.articlesSection": "Articles",

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
  "add.fab": "Add torrent",
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
};

const ja: Record<MessageKey, string> = {
  "app.loading": "読み込み中…",
  "app.loadingHint": "少々お待ちください",
  "app.hello": "こんにちは、{name}",
  "app.nav": "メインメニュー",
  "app.tab.downloads": "ダウンロード",
  "app.tab.rss": "RSS",
  "app.tab.more": "その他",
  "app.refresh": "更新",
  "app.refreshFailed": "更新に失敗しました",
  "app.pullToRefresh": "引っ張りで更新",
  "app.refreshing": "更新中…",
  "app.actionFailed": "操作に失敗しました",
  "app.previewUser": "ローカルプレビュー",

  "sheet.close": "閉じる",
  "sheet.done": "完了",
  "more.title": "その他",
  "more.appearance": "外観と言語",

  "pwa.installTitle": "ホーム画面に追加",
  "pwa.installHint": "インストールすると App のように全画面で使えます。",
  "pwa.installHintIos": "Safari：共有 → ホーム画面に追加",
  "pwa.installAction": "インストール",
  "pwa.installDismiss": "後で",
  "pwa.offlineTitle": "オフラインです",
  "pwa.offlineHint": "接続が戻ったら引っ張って更新",
  "pwa.offlineBanner": "オフライン — 引っ張って再試行",

  "signIn.title": "qBittorrent Web App",
  "signIn.hintStandalone":
    "Google アカウントでサインインします。許可リストのメールのみ qBittorrent に接続できます。",
  "signIn.hintBrowser":
    "Google アカウントでサインインして qBittorrent にアクセスします（許可リスト必須）。",
  "signIn.failed":
    "Google サインインに失敗しました。メールが許可リストにあるか確認してください。",
  "signIn.missingClientId":
    "GOOGLE_CLIENT_ID が未設定のため、サインインボタンを表示できません。",
  "signIn.footer":
    "Safari で共有 → ホーム画面に追加するとフルスクリーンで使えます。",

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
  "list.emptyHint": "右下の ＋ から magnet または torrent URL を追加",
  "list.emptyFiltered": "この状態のトレントはありません",
  "list.options": "リストオプション",
  "list.sortSection": "並べ替え",
  "list.batchSection": "一括",
  "rss.back": "戻る",
  "rss.feedsSection": "フィード",
  "rss.articlesSection": "記事",

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
  "add.fab": "トレントを追加",
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
