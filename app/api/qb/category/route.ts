import { handleApiError, jsonOk, readHashesBody, requireAuth } from "@/lib/api";
import { setTorrentCategory } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const parsed = await readHashesBody<{
      hashes?: string;
      category?: string;
    }>(request);
    if (parsed instanceof Response) return parsed;
    await setTorrentCategory(parsed.hashes, parsed.body.category?.trim() ?? "");
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
