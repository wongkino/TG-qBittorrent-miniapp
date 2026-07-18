import { handleApiError, jsonError, jsonOk, requireAuth } from "@/lib/api";
import { deleteTorrents } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = (await request.json()) as {
      hashes?: string;
      deleteFiles?: boolean;
    };
    const hashes = body.hashes?.trim();
    if (!hashes) return jsonError("hashes is required", 400);
    await deleteTorrents(hashes, Boolean(body.deleteFiles));
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
