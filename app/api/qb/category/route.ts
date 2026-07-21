import { jsonOk, readHashesBody, withAuth } from "@/lib/api";
import { setTorrentCategory } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readHashesBody<{
    hashes?: string;
    category?: string;
  }>(request);
  if (parsed instanceof Response) return parsed;
  await setTorrentCategory(parsed.hashes, parsed.body.category?.trim() ?? "");
  return jsonOk();
});
