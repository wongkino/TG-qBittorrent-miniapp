import { handleApiError, jsonError, jsonOk, requireAuth } from "@/lib/api";
import { addTorrent } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = (await request.json()) as { urls?: string };
    const urls = body.urls?.trim();
    if (!urls) return jsonError("urls is required", 400);
    await addTorrent(urls);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
