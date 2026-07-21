import {
  handleApiError,
  jsonOk,
  previewResponse,
  readHashesBody,
  requireAuth,
} from "@/lib/api";
import { pauseTorrents } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    const preview = previewResponse(auth);
    if (preview) return preview;

    const parsed = await readHashesBody(request);
    if (parsed instanceof Response) return parsed;
    await pauseTorrents(parsed.hashes);
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
