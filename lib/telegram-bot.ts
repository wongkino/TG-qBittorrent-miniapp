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

export async function sendTelegramMessage(
  chatId: number | string,
  text: string
): Promise<void> {
  const token = env("TELEGRAM_BOT_TOKEN");
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    description?: string;
  } | null;

  if (!res.ok || !data?.ok) {
    throw new Error(
      data?.description || `Telegram sendMessage failed (${res.status})`
    );
  }
}

export function formatCompletionMessage(input: {
  name: string;
  sizeLabel: string;
  category?: string;
}): string {
  const lines = [
    "✅ <b>下載完成</b>",
    "",
    escapeHtml(input.name),
    `大小：${escapeHtml(input.sizeLabel)}`,
  ];
  if (input.category) {
    lines.push(`分類：${escapeHtml(input.category)}`);
  }
  return lines.join("\n");
}

export function getNotifyChatIds(): number[] {
  return (env("ALLOWED_TELEGRAM_USER_IDS") ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
}
