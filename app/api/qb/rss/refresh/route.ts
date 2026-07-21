import { jsonOk, readRequiredString, withAuth } from "@/lib/api";
import { refreshRssItem } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readRequiredString(request, "path");
  if (parsed instanceof Response) return parsed;
  await refreshRssItem(parsed.value);
  return jsonOk();
});
