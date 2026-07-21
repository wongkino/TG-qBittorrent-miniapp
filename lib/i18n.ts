export type Locale = "zh-Hant" | "zh-Hans" | "en";

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
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  "zh-Hant": zhHant,
  "zh-Hans": zhHans,
  en,
};

const TRADITIONAL_TAGS = new Set([
  "zh-hant",
  "zh-tw",
  "zh-hk",
  "zh-mo",
]);

const SIMPLIFIED_TAGS = new Set([
  "zh",
  "zh-hans",
  "zh-cn",
  "zh-sg",
]);

/** Map Telegram / browser language tag to app locale. */
export function resolveLocale(languageCode?: string | null): Locale {
  if (!languageCode?.trim()) return "zh-Hant";
  const code = languageCode.trim().toLowerCase().replace(/_/g, "-");

  if (
    TRADITIONAL_TAGS.has(code) ||
    code.startsWith("zh-hant") ||
    code.startsWith("zh-tw") ||
    code.startsWith("zh-hk") ||
    code.startsWith("zh-mo")
  ) {
    return "zh-Hant";
  }
  if (
    SIMPLIFIED_TAGS.has(code) ||
    code.startsWith("zh-hans") ||
    code.startsWith("zh-cn") ||
    code.startsWith("zh")
  ) {
    return "zh-Hans";
  }
  return "en";
}

/** Optional override: `?lang=en` | `zh-Hans` | `zh-Hant` | `zh` | `zh-TW` … */
export function languageCodeFromUrl(
  search?: string | null
): string | null {
  if (typeof search !== "string" && typeof window !== "undefined") {
    search = window.location.search;
  }
  if (!search) return null;
  try {
    const raw = new URLSearchParams(search).get("lang")?.trim();
    if (!raw) return null;
    // Accept locale ids or BCP-47 tags.
    if (raw === "zh-Hant" || raw === "zh-Hans" || raw === "en") return raw;
    return raw;
  } catch {
    return null;
  }
}

export function languageCodeFromInitData(initData: string): string | null {
  try {
    const userRaw = new URLSearchParams(initData).get("user");
    if (!userRaw) return null;
    const user = JSON.parse(userRaw) as { language_code?: string };
    return user.language_code?.trim() || null;
  } catch {
    return null;
  }
}

export function browserLanguageCode(): string | null {
  if (typeof navigator === "undefined") return null;
  return navigator.languages?.[0] || navigator.language || null;
}

/**
 * Prefer: URL ?lang= → Telegram user.language_code → initData user → browser.
 */
export function detectLanguageCode(input?: {
  telegramLanguageCode?: string | null;
  initData?: string | null;
  search?: string | null;
}): string {
  const fromUrl = languageCodeFromUrl(input?.search);
  if (fromUrl) return fromUrl;

  const fromTg = input?.telegramLanguageCode?.trim();
  if (fromTg) return fromTg;

  if (input?.initData) {
    const fromInit = languageCodeFromInitData(input.initData);
    if (fromInit) return fromInit;
  }

  return browserLanguageCode() || "zh-Hant";
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  let text = messages[locale][key] ?? messages["zh-Hant"][key] ?? key;
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
