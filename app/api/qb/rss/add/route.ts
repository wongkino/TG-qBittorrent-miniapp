import { handleApiError, jsonError, jsonOk, requireAuth } from "@/lib/api";
import { addRssFeed } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = (await request.json()) as { url?: string; path?: string };
    const url = body.url?.trim();
    if (!url) return jsonError("url is required", 400);
    await addRssFeed(url, body.path?.trim() || undefined);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
