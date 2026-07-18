import { handleApiError, jsonOk, requireAuth } from "@/lib/api";
import { listCategories } from "@/lib/qbittorrent";

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const categories = await listCategories();
    return jsonOk({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}
