import { handleApiError, jsonOk, requireAuth } from "@/lib/api";
import { listCategories, listTorrents } from "@/lib/qbittorrent";

/** Single round-trip for UI boot / manual refresh (torrents + categories). */
export async function GET(request: Request) {
  try {
    requireAuth(request);
    const [torrents, categories] = await Promise.all([
      listTorrents(),
      listCategories(),
    ]);
    return jsonOk({ torrents, categories });
  } catch (err) {
    return handleApiError(err);
  }
}
