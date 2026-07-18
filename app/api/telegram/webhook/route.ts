import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { handleTelegramUpdate } from "@/lib/bot-handler";

function authorizeTelegram(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("x-telegram-bot-api-secret-token") === secret;
}

export async function POST(request: Request) {
  try {
    if (!authorizeTelegram(request)) {
      return jsonError("Unauthorized", 401);
    }

    const update = (await request.json()) as {
      update_id: number;
      message?: unknown;
    };

    // Respond quickly; process after acknowledgment where possible.
    await handleTelegramUpdate(update as Parameters<typeof handleTelegramUpdate>[0]);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
