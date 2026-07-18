import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { notifyTorrentEvents } from "@/lib/completions";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function run(request: Request) {
  if (!authorizeCron(request)) {
    return jsonError("Unauthorized", 401);
  }

  const result = await notifyTorrentEvents();
  return jsonOk({ ok: true, ...result });
}

export async function GET(request: Request) {
  try {
    return await run(request);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    return await run(request);
  } catch (err) {
    return handleApiError(err);
  }
}
