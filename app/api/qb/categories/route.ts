import { handleApiError, jsonOk, previewResponse, requireAuth } from "@/lib/api";
import { mockCategories } from "@/lib/dev/preview";
import { listCategories } from "@/lib/qbittorrent";

export async function GET(request: Request) {
  try {
    const auth = requireAuth(request);
    const preview = previewResponse(auth, { categories: mockCategories() });
    if (preview) return preview;

    const categories = await listCategories();
    return jsonOk({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}
