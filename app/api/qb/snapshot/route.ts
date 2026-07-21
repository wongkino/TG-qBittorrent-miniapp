import { handleApiError, jsonOk, previewResponse, requireAuth } from "@/lib/api";
import { mockCategories, mockTorrents } from "@/lib/dev/preview";
import { listCategories, listTorrents } from "@/lib/qbittorrent";

/** Single round-trip for UI boot / manual refresh (torrents + categories). */
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    const preview = previewResponse(auth, {
      torrents: mockTorrents(),
      categories: mockCategories(),
    });
    if (preview) return preview;

    const [torrents, categories] = await Promise.all([
      listTorrents(),
      listCategories(),
    ]);
    return jsonOk({ torrents, categories });
  } catch (err) {
    return handleApiError(err);
  }
}
