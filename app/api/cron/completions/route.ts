import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { notifyTorrentEvents } from "@/lib/completions";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  try {
    if (!authorizeCron(request)) {
      return jsonError("Unauthorized", 401);
    }
    const result = await notifyTorrentEvents();
    return jsonOk({ ok: true, ...result });
  } catch (err) {
    return handleApiError(err);
  }
}
