import { jsonOk, readRequiredString, withAuth } from "@/lib/api";
import { removeRssItem } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readRequiredString(request, "path");
  if (parsed instanceof Response) return parsed;
  await removeRssItem(parsed.value);
  return jsonOk();
});
