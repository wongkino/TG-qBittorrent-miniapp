import { formatBytes } from "@/lib/format";
import {
  addTorrentTags,
  listTorrentsForNotify,
  type NotifyTorrent,
} from "@/lib/qbittorrent";
import {
  formatCompletionMessage,
  getNotifyChatIds,
  sendTelegramMessage,
} from "@/lib/telegram-bot";

export const COMPLETION_NOTIFY_TAG = "tg-notified";

/** Only notify completions that finished within this window. */
const COMPLETION_WINDOW_SEC = 15 * 60;

function hasTag(torrent: NotifyTorrent, tag: string): boolean {
  return torrent.tags
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .includes(tag);
}

function isRecentlyCompleted(torrent: NotifyTorrent, nowSec: number): boolean {
  if (torrent.progress < 1 || torrent.completion_on <= 0) return false;
  const age = nowSec - torrent.completion_on;
  return age >= 0 && age <= COMPLETION_WINDOW_SEC;
}

export type CompletionNotifyResult = {
  checked: number;
  notified: number;
  names: string[];
};

export async function notifyNewCompletions(): Promise<CompletionNotifyResult> {
  const chatIds = getNotifyChatIds();
  if (chatIds.length === 0) {
    throw new Error("ALLOWED_TELEGRAM_USER_IDS is not configured");
  }

  const torrents = await listTorrentsForNotify();
  const nowSec = Math.floor(Date.now() / 1000);
  const pending = torrents.filter(
    (t) =>
      isRecentlyCompleted(t, nowSec) && !hasTag(t, COMPLETION_NOTIFY_TAG)
  );

  const names: string[] = [];

  for (const torrent of pending) {
    const text = formatCompletionMessage({
      name: torrent.name,
      sizeLabel: formatBytes(torrent.size),
      category: torrent.category || undefined,
    });

    for (const chatId of chatIds) {
      await sendTelegramMessage(chatId, text);
    }

    await addTorrentTags(torrent.hash, COMPLETION_NOTIFY_TAG);
    names.push(torrent.name);
  }

  return {
    checked: torrents.length,
    notified: names.length,
    names,
  };
}
