import { handleApiError, jsonOk, requireAuth } from "@/lib/api";
import { listRssFeeds } from "@/lib/qbittorrent";

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const feeds = await listRssFeeds();
    return jsonOk({ feeds });
  } catch (err) {
    return handleApiError(err);
  }
}
