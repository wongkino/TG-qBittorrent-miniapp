import {
  handleApiError,
  jsonError,
  jsonOk,
  previewResponse,
  requireAuth,
} from "@/lib/api";
import { addRssFeed } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const preview = previewResponse(auth);
    if (preview) return preview;

    const body = (await request.json()) as { url?: string; path?: string };
    const url = body.url?.trim();
    if (!url) return jsonError("url is required", 400);
    await addRssFeed(url, body.path?.trim() || undefined);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
