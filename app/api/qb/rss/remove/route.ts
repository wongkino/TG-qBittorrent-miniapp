import { handleApiError, jsonError, jsonOk, requireAuth } from "@/lib/api";
import { removeRssItem } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = (await request.json()) as { path?: string };
    const path = body.path?.trim();
    if (!path) return jsonError("path is required", 400);
    await removeRssItem(path);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
