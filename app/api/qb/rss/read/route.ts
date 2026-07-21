import {
  handleApiError,
  jsonError,
  jsonOk,
  previewResponse,
  requireAuth,
} from "@/lib/api";
import { markRssArticleRead } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    const preview = previewResponse(auth);
    if (preview) return preview;

    const body = (await request.json()) as {
      path?: string;
      articleId?: string;
    };
    const path = body.path?.trim();
    if (!path) return jsonError("path is required", 400);
    await markRssArticleRead(path, body.articleId?.trim() || undefined);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
