import {
  handleApiError,
  jsonOk,
  previewResponse,
  readHashesBody,
  requireAuth,
} from "@/lib/api";
import { deleteTorrents } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request);
    const preview = previewResponse(auth);
    if (preview) return preview;

    const parsed = await readHashesBody<{
      hashes?: string;
      deleteFiles?: boolean;
    }>(request);
    if (parsed instanceof Response) return parsed;
    await deleteTorrents(parsed.hashes, Boolean(parsed.body.deleteFiles));
    return jsonOk();
  } catch (err) {
    return handleApiError(err);
  }
}
