import { handleApiError, jsonOk, readHashes, requireAuth } from "@/lib/api";
import { pauseTorrents } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const hashes = await readHashes(request);
    if (typeof hashes !== "string") return hashes;
    await pauseTorrents(hashes);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
