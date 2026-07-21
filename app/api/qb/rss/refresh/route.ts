import {
  handleApiError,
  jsonError,
  jsonOk,
  previewResponse,
  requireAuth,
} from "@/lib/api";
import { refreshRssItem } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const preview = previewResponse(auth);
    if (preview) return preview;

    const body = (await request.json()) as { path?: string };
    const path = body.path?.trim();
    if (!path) return jsonError("path is required", 400);
    await refreshRssItem(path);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
