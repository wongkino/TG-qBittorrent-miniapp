function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function botToken(): string {
  const token = env("TELEGRAM_BOT_TOKEN");
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

async function telegramApi<T>(
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${botToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = (await res.json()) as {
    ok?: boolean;
    description?: string;
    result?: T;
  };
  if (!res.ok || !data.ok || data.result === undefined) {
    throw new Error(data.description || `Telegram ${method} failed (${res.status})`);
  }
  return data.result;
}

export type ReplyKeyboard = {
  keyboard: Array<Array<{ text: string }>>;
  resize_keyboard?: boolean;
  is_persistent?: boolean;
  one_time_keyboard?: boolean;
};

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  options?: { replyMarkup?: ReplyKeyboard }
): Promise<void> {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(options?.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
  });
}

export async function downloadTelegramFile(
  fileId: string
): Promise<{ bytes: ArrayBuffer; path: string }> {
  const file = await telegramApi<{ file_path?: string }>("getFile", {
    file_id: fileId,
  });
  if (!file.file_path) {
    throw new Error("Telegram file path missing");
  }
  const res = await fetch(
    `https://api.telegram.org/file/bot${botToken()}/${file.file_path}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`Failed to download Telegram file (${res.status})`);
  }
  return { bytes: await res.arrayBuffer(), path: file.file_path };
}

function formatTorrentEventMessage(
  title: string,
  input: { name: string; sizeLabel: string; category?: string }
): string {
  const lines = [
    title,
    "",
    escapeHtml(input.name),
    `大小：${escapeHtml(input.sizeLabel)}`,
  ];
  if (input.category) {
    lines.push(`分類：${escapeHtml(input.category)}`);
  }
  return lines.join("\n");
}

export function formatStartMessage(input: {
  name: string;
  sizeLabel: string;
  category?: string;
}): string {
  return formatTorrentEventMessage("⬇️ <b>下載開始</b>", input);
}

export function formatCompletionMessage(input: {
  name: string;
  sizeLabel: string;
  category?: string;
}): string {
  return formatTorrentEventMessage("✅ <b>下載完成</b>", input);
}

export function getNotifyChatIds(): number[] {
  return (env("ALLOWED_TELEGRAM_USER_IDS") ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
}

export function isAllowedChatUser(userId: number): boolean {
  return getNotifyChatIds().includes(userId);
}

export { escapeHtml };
