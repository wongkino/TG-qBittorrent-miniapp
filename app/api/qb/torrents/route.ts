import { handleApiError, jsonOk, requireAuth } from "@/lib/api";
import { listTorrents } from "@/lib/qbittorrent";

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const torrents = await listTorrents();
    return jsonOk({ torrents });
  } catch (err) {
    return handleApiError(err);
  }
}
