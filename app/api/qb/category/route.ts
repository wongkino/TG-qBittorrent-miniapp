import {
  handleApiError,
  jsonOk,
  previewResponse,
  readHashesBody,
  requireAuth,
} from "@/lib/api";
import { setTorrentCategory } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    const preview = previewResponse(auth);
    if (preview) return preview;

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
