import { formatProgress, formatSpeed, isPausedState } from "@/lib/format";
import {
  DEFAULT_LOCALE,
  LOCALES,
  translate,
  type Locale,
} from "@/lib/i18n";
import { addTorrent, addTorrentFile, listTorrents } from "@/lib/qbittorrent";
import {
  downloadTelegramFile,
  escapeHtml,
  isAllowedChatUser,
  sendTelegramMessage,
  type ReplyKeyboard,
} from "@/lib/telegram-bot";
import { getUserLocale } from "@/lib/user-locale";

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

type BotAction = "status" | "list" | "help";

function t(
  locale: Locale,
  key: Parameters<typeof translate>[1],
  vars?: Record<string, string | number>
) {
  return translate(locale, key, vars);
}

function mainKeyboard(locale: Locale): ReplyKeyboard {
  return {
    keyboard: [
      [
        { text: t(locale, "bot.btn.status") },
        { text: t(locale, "bot.btn.list") },
        { text: t(locale, "bot.btn.help") },
      ],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function helpText(locale: Locale): string {
  return [
    `<b>${t(locale, "bot.helpTitle")}</b>`,
    `• ${t(locale, "bot.btn.status")} — ${t(locale, "bot.helpStatus")}`,
    `• ${t(locale, "bot.btn.list")} — ${t(locale, "bot.helpList")}`,
    `• ${t(locale, "bot.btn.help")} — ${t(locale, "bot.helpHelp")}`,
    "",
    t(locale, "bot.helpAlso"),
    t(locale, "bot.helpMagnet"),
    t(locale, "bot.helpFile"),
  ].join("\n");
}

function matchAction(text: string): BotAction | null {
  for (const locale of LOCALES) {
    if (text === t(locale, "bot.btn.status")) return "status";
    if (text === t(locale, "bot.btn.list")) return "list";
    if (text === t(locale, "bot.btn.help")) return "help";
  }
  return null;
}

function magnetOrTorrentUrl(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^magnet:\?/i.test(trimmed)) return trimmed;
  if (/^https?:\/\/\S+\.torrent(\?\S*)?$/i.test(trimmed)) return trimmed;
  if (
    /^https?:\/\/\S+/i.test(trimmed) &&
    trimmed.toLowerCase().includes("torrent")
  ) {
    return trimmed;
  }
  return null;
}

async function reply(chatId: number, locale: Locale, text: string) {
  await sendTelegramMessage(chatId, text, {
    replyMarkup: mainKeyboard(locale),
  });
}

async function handleStatus(chatId: number, locale: Locale) {
  const torrents = await listTorrents();
  const active = torrents.filter((torrent) => !isPausedState(torrent.state));
  const downloading = torrents.filter(
    (torrent) => torrent.progress < 1 && !isPausedState(torrent.state)
  );
  const seeding = torrents.filter(
    (torrent) => torrent.progress >= 1 && !isPausedState(torrent.state)
  );
  const paused = torrents.filter((torrent) => isPausedState(torrent.state));
  const dl = torrents.reduce((sum, torrent) => sum + torrent.dlspeed, 0);
  const up = torrents.reduce((sum, torrent) => sum + torrent.upspeed, 0);

  await reply(
    chatId,
    locale,
    [
      `<b>${t(locale, "bot.statusTitle")}</b>`,
      t(locale, "bot.statusTotal", { count: torrents.length }),
      t(locale, "bot.statusDownloading", { count: downloading.length }),
      t(locale, "bot.statusSeeding", { count: seeding.length }),
      t(locale, "bot.statusPaused", { count: paused.length }),
      t(locale, "bot.statusActive", { count: active.length }),
      `↓ ${escapeHtml(formatSpeed(dl))}  ↑ ${escapeHtml(formatSpeed(up))}`,
    ].join("\n")
  );
}

async function handleList(chatId: number, locale: Locale) {
  const torrents = await listTorrents();
  const active = torrents
    .filter(
      (torrent) =>
        torrent.progress < 1 || torrent.dlspeed > 0 || torrent.upspeed > 0
    )
    .slice(0, 15);

  if (active.length === 0) {
    await reply(chatId, locale, t(locale, "bot.listEmpty"));
    return;
  }

  const lines = active.map((torrent, i) => {
    const name =
      torrent.name.length > 40
        ? `${escapeHtml(torrent.name.slice(0, 40))}…`
        : escapeHtml(torrent.name);
    return `${i + 1}. ${name}\n${formatProgress(torrent.progress)} · ↓${formatSpeed(torrent.dlspeed)}`;
  });
  await reply(
    chatId,
    locale,
    [`<b>${t(locale, "bot.listTitle")}</b>`, ...lines].join("\n\n")
  );
}

async function handleAddUrl(chatId: number, locale: Locale, url: string) {
  await addTorrent(url);
  await reply(
    chatId,
    locale,
    t(locale, "bot.addedUrl", { url: escapeHtml(url.slice(0, 200)) })
  );
}

async function handleTorrentDocument(
  chatId: number,
  locale: Locale,
  doc: TelegramDocument
): Promise<void> {
  const fileName = doc.file_name || "file.torrent";
  const isTorrent =
    fileName.toLowerCase().endsWith(".torrent") ||
    doc.mime_type === "application/x-bittorrent";

  if (!isTorrent) {
    await reply(chatId, locale, t(locale, "bot.needTorrent"));
    return;
  }

  const { bytes, path } = await downloadTelegramFile(doc.file_id);
  const name = fileName.toLowerCase().endsWith(".torrent")
    ? fileName
    : path.split("/").pop() || "file.torrent";

  await addTorrentFile(new Blob([new Uint8Array(bytes)]), name);
  await reply(
    chatId,
    locale,
    t(locale, "bot.addedFile", { name: escapeHtml(name) })
  );
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message?.chat) return;

  const userId = message.from?.id;
  if (!userId || !isAllowedChatUser(userId)) {
    if (message.chat.type === "private" && message.chat.id) {
      await reply(
        message.chat.id,
        DEFAULT_LOCALE,
        t(DEFAULT_LOCALE, "bot.unauthorized")
      );
    }
    return;
  }

  const chatId = message.chat.id;
  const locale = await getUserLocale(userId);

  if (message.document) {
    await handleTorrentDocument(chatId, locale, message.document);
    return;
  }

  const text = (message.text || message.caption || "").trim();
  if (!text) return;

  const command = text.split(/\s+/)[0]?.toLowerCase().replace(/@\w+$/, "");
  const action = matchAction(text);

  if (command === "/start") {
    await reply(
      chatId,
      locale,
      [t(locale, "bot.start"), "", helpText(locale)].join("\n")
    );
    return;
  }
  if (command === "/help" || action === "help") {
    await reply(chatId, locale, helpText(locale));
    return;
  }
  if (command === "/status" || action === "status") {
    await handleStatus(chatId, locale);
    return;
  }
  if (command === "/list" || action === "list") {
    await handleList(chatId, locale);
    return;
  }

  const url = magnetOrTorrentUrl(text);
  if (url) {
    await handleAddUrl(chatId, locale, url);
    return;
  }

  if (text.startsWith("/")) {
    await reply(
      chatId,
      locale,
      `${t(locale, "bot.unknown")}\n\n${helpText(locale)}`
    );
  }
}
