import { handleApiError, jsonOk, readHashesBody, requireAuth } from "@/lib/api";
import { pauseTorrents } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const parsed = await readHashesBody(request);
    if (parsed instanceof Response) return parsed;
    await pauseTorrents(parsed.hashes);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
