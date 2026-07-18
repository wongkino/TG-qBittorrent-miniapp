import { handleApiError, jsonOk, readHashesBody, requireAuth } from "@/lib/api";
import { resumeTorrents } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const parsed = await readHashesBody(request);
    if (parsed instanceof Response) return parsed;
    await resumeTorrents(parsed.hashes);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
