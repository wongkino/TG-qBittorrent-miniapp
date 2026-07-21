import { handleApiError, jsonOk, previewResponse, requireAuth } from "@/lib/api";
import { mockTorrents } from "@/lib/dev/preview";
import { listTorrents } from "@/lib/qbittorrent";

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    const preview = previewResponse(auth, { torrents: mockTorrents() });
    if (preview) return preview;

    const torrents = await listTorrents();
    return jsonOk({ torrents });
  } catch (err) {
    return handleApiError(err);
  }
}
