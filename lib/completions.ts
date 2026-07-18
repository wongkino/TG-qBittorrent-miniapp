import { formatBytes } from "@/lib/format";
import {
  addTorrentTags,
  listTorrentsForNotify,
  type NotifyTorrent,
} from "@/lib/qbittorrent";
import {
  formatCompletionMessage,
  formatStartMessage,
  getNotifyChatIds,
  sendTelegramMessage,
} from "@/lib/telegram-bot";

export const COMPLETION_NOTIFY_TAG = "tg-notified";
export const START_NOTIFY_TAG = "tg-started";

/** Only notify events within this window. */
const NOTIFY_WINDOW_SEC = 15 * 60;

function hasTag(torrent: NotifyTorrent, tag: string): boolean {
  return torrent.tags
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .includes(tag);
}

function isRecentlyStarted(torrent: NotifyTorrent, nowSec: number): boolean {
  if (torrent.added_on <= 0) return false;
  // Skip torrents that were already finished when added.
  if (torrent.progress >= 1 && torrent.completion_on > 0) return false;
  const age = nowSec - torrent.added_on;
  return age >= 0 && age <= NOTIFY_WINDOW_SEC;
}

function isRecentlyCompleted(torrent: NotifyTorrent, nowSec: number): boolean {
  if (torrent.progress < 1 || torrent.completion_on <= 0) return false;
  const age = nowSec - torrent.completion_on;
  return age >= 0 && age <= NOTIFY_WINDOW_SEC;
}

export type EventNotifyResult = {
  checked: number;
  started: number;
  completed: number;
  startedNames: string[];
  completedNames: string[];
};

async function notifyChats(text: string, chatIds: number[]): Promise<void> {
  for (const chatId of chatIds) {
    await sendTelegramMessage(chatId, text);
  }
}

export async function notifyTorrentEvents(): Promise<EventNotifyResult> {
  const chatIds = getNotifyChatIds();
  if (chatIds.length === 0) {
    throw new Error("ALLOWED_TELEGRAM_USER_IDS is not configured");
  }

  const torrents = await listTorrentsForNotify();
  const nowSec = Math.floor(Date.now() / 1000);

  const startedNames: string[] = [];
  const completedNames: string[] = [];

  const pendingStarts = torrents.filter(
    (t) =>
      isRecentlyStarted(t, nowSec) &&
      !hasTag(t, START_NOTIFY_TAG) &&
      !hasTag(t, COMPLETION_NOTIFY_TAG)
  );

  for (const torrent of pendingStarts) {
    await notifyChats(
      formatStartMessage({
        name: torrent.name,
        sizeLabel: formatBytes(torrent.size),
        category: torrent.category || undefined,
      }),
      chatIds
    );
    await addTorrentTags(torrent.hash, START_NOTIFY_TAG);
    startedNames.push(torrent.name);
  }

  const pendingCompletions = torrents.filter(
    (t) =>
      isRecentlyCompleted(t, nowSec) && !hasTag(t, COMPLETION_NOTIFY_TAG)
  );

  for (const torrent of pendingCompletions) {
    await notifyChats(
      formatCompletionMessage({
        name: torrent.name,
        sizeLabel: formatBytes(torrent.size),
        category: torrent.category || undefined,
      }),
      chatIds
    );
    await addTorrentTags(torrent.hash, COMPLETION_NOTIFY_TAG);
    completedNames.push(torrent.name);
  }

  return {
    checked: torrents.length,
    started: startedNames.length,
    completed: completedNames.length,
    startedNames,
    completedNames,
  };
}

/** @deprecated Prefer notifyTorrentEvents */
export async function notifyNewCompletions() {
  const result = await notifyTorrentEvents();
  return {
    checked: result.checked,
    notified: result.completed,
    names: result.completedNames,
  };
}
