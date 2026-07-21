import {
  handleApiError,
  jsonError,
  jsonOk,
  previewResponse,
  requireAuth,
} from "@/lib/api";
import { addTorrent } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const preview = previewResponse(auth);
    if (preview) return preview;

    const body = (await request.json()) as {
      urls?: string;
      category?: string;
    };
    const urls = body.urls?.trim();
    if (!urls) return jsonError("urls is required", 400);
    await addTorrent(urls, body.category?.trim() || undefined);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
