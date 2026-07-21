import { jsonOk, readHashesBody, withAuth } from "@/lib/api";
import { deleteTorrents } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readHashesBody<{
    hashes?: string;
    deleteFiles?: boolean;
  }>(request);
  if (parsed instanceof Response) return parsed;
  await deleteTorrents(parsed.hashes, Boolean(parsed.body.deleteFiles));
  return jsonOk();
});
