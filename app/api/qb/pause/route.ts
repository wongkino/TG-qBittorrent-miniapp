import { jsonOk, readHashesBody, withAuth } from "@/lib/api";
import { pauseTorrents } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readHashesBody(request);
  if (parsed instanceof Response) return parsed;
  await pauseTorrents(parsed.hashes);
  return jsonOk();
});
