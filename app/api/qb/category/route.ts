import { handleApiError, jsonError, jsonOk, requireAuth } from "@/lib/api";
import { setTorrentCategory } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = (await request.json()) as {
      hashes?: string;
      category?: string;
    };
    const hashes = body.hashes?.trim();
    if (!hashes) return jsonError("hashes is required", 400);
    await setTorrentCategory(hashes, body.category?.trim() ?? "");
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
