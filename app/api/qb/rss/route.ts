import { handleApiError, jsonOk, previewResponse, requireAuth } from "@/lib/api";
import { mockRssFeeds } from "@/lib/dev/preview";
import { listRssFeeds } from "@/lib/qbittorrent";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    const preview = previewResponse(auth, { feeds: mockRssFeeds() });
    if (preview) return preview;

    const feeds = await listRssFeeds();
    return jsonOk({ feeds });
  } catch (err) {
    return handleApiError(err);
  }
}
