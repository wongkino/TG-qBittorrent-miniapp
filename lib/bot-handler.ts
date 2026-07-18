import { formatProgress, formatSpeed, isPausedState } from "@/lib/format";
import { addTorrent, addTorrentFile, listTorrents } from "@/lib/qbittorrent";
import {
  downloadTelegramFile,
  escapeHtml,
  isAllowedChatUser,
  sendTelegramMessage,
  type ReplyKeyboard,
} from "@/lib/telegram-bot";

type TelegramUser = { id: number; first_name?: string; username?: string };
type TelegramChat = { id: number; type: string };
type TelegramDocument = {
  file_id: string;
  file_name?: string;
  mime_type?: string;
};
type TelegramMessage = {
  message_id: number;
  chat: TelegramChat;
  from?: TelegramUser;
  text?: string;
  caption?: string;
  document?: TelegramDocument;
};
type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

const BTN_STATUS = "狀態";
const BTN_LIST = "列表";
const BTN_HELP = "說明";

const MAIN_KEYBOARD: ReplyKeyboard = {
  keyboard: [[{ text: BTN_STATUS }, { text: BTN_LIST }, { text: BTN_HELP }]],
  resize_keyboard: true,
  is_persistent: true,
};

const HELP_TEXT = [
  "<b>可用操作</b>",
  `• ${BTN_STATUS} — 目前下載狀態`,
  `• ${BTN_LIST} — 列出進行中的種子`,
  `• ${BTN_HELP} — 顯示說明`,
  "",
  "也可直接傳：",
  "• magnet / .torrent 連結文字",
  "• .torrent 檔案",
].join("\n");

function magnetOrTorrentUrl(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^magnet:\?/i.test(trimmed)) return trimmed;
  if (/^https?:\/\/\S+\.torrent(\?\S*)?$/i.test(trimmed)) return trimmed;
  if (/^https?:\/\/\S+/i.test(trimmed) && trimmed.toLowerCase().includes("torrent")) {
    return trimmed;
  }
  return null;
}

async function reply(
  chatId: number,
  text: string,
  withKeyboard = false
) {
  await sendTelegramMessage(
    chatId,
    text,
    withKeyboard ? { replyMarkup: MAIN_KEYBOARD } : undefined
  );
}

async function handleStatus(chatId: number) {
  const torrents = await listTorrents();
  const active = torrents.filter((t) => !isPausedState(t.state));
  const downloading = torrents.filter((t) => t.progress < 1 && !isPausedState(t.state));
  const seeding = torrents.filter((t) => t.progress >= 1 && !isPausedState(t.state));
  const paused = torrents.filter((t) => isPausedState(t.state));
  const dl = torrents.reduce((sum, t) => sum + t.dlspeed, 0);
  const up = torrents.reduce((sum, t) => sum + t.upspeed, 0);

  await reply(
    chatId,
    [
      "<b>qBittorrent 狀態</b>",
      `總數：${torrents.length}`,
      `下載中：${downloading.length}`,
      `做種中：${seeding.length}`,
      `已暫停：${paused.length}`,
      `活躍：${active.length}`,
      `↓ ${escapeHtml(formatSpeed(dl))}  ↑ ${escapeHtml(formatSpeed(up))}`,
    ].join("\n")
  );
}

async function handleList(chatId: number) {
  const torrents = await listTorrents();
  const active = torrents
    .filter((t) => t.progress < 1 || t.dlspeed > 0 || t.upspeed > 0)
    .slice(0, 15);

  if (active.length === 0) {
    await reply(chatId, "目前沒有進行中的種子。");
    return;
  }

  const lines = active.map((t, i) => {
    const name =
      t.name.length > 40 ? `${escapeHtml(t.name.slice(0, 40))}…` : escapeHtml(t.name);
    return `${i + 1}. ${name}\n${formatProgress(t.progress)} · ↓${formatSpeed(t.dlspeed)}`;
  });
  await reply(chatId, ["<b>進行中</b>", ...lines].join("\n\n"));
}

async function handleAddUrl(chatId: number, url: string) {
  await addTorrent(url);
  await reply(chatId, `已加入：\n<code>${escapeHtml(url.slice(0, 200))}</code>`);
}

async function handleTorrentDocument(
  chatId: number,
  doc: TelegramDocument
): Promise<void> {
  const fileName = doc.file_name || "file.torrent";
  const isTorrent =
    fileName.toLowerCase().endsWith(".torrent") ||
    doc.mime_type === "application/x-bittorrent";

  if (!isTorrent) {
    await reply(chatId, "請傳送 .torrent 檔案。");
    return;
  }

  const { bytes, path } = await downloadTelegramFile(doc.file_id);
  const name = fileName.toLowerCase().endsWith(".torrent")
    ? fileName
    : path.split("/").pop() || "file.torrent";

  await addTorrentFile(new Blob([new Uint8Array(bytes)]), name);
  await reply(chatId, `已加入種子檔：\n<code>${escapeHtml(name)}</code>`);
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message?.chat) return;

  const userId = message.from?.id;
  if (!userId || !isAllowedChatUser(userId)) {
    if (message.chat.type === "private" && message.chat.id) {
      await reply(message.chat.id, "未授權使用此 Bot。");
    }
    return;
  }

  const chatId = message.chat.id;

  if (message.document) {
    await handleTorrentDocument(chatId, message.document);
    return;
  }

  const text = (message.text || message.caption || "").trim();
  if (!text) return;

  const command = text.split(/\s+/)[0]?.toLowerCase().replace(/@\w+$/, "");

  if (command === "/start") {
    await reply(
      chatId,
      ["👋 已連線到 qBittorrent Mini App Bot。", "", HELP_TEXT].join("\n"),
      true
    );
    return;
  }
  if (command === "/help" || text === BTN_HELP) {
    await reply(chatId, HELP_TEXT, true);
    return;
  }
  if (command === "/status" || text === BTN_STATUS) {
    await handleStatus(chatId);
    return;
  }
  if (command === "/list" || text === BTN_LIST) {
    await handleList(chatId);
    return;
  }

  const url = magnetOrTorrentUrl(text);
  if (url) {
    await handleAddUrl(chatId, url);
    return;
  }

  if (text.startsWith("/")) {
    await reply(chatId, `未知指令。\n\n${HELP_TEXT}`, true);
  }
}
