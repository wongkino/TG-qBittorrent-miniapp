import { jsonOk, readRequiredString, withAuth } from "@/lib/api";
import { addRssFeed } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readRequiredString(request, "url");
  if (parsed instanceof Response) return parsed;
  const path =
    typeof parsed.body.path === "string"
      ? parsed.body.path.trim() || undefined
      : undefined;
  await addRssFeed(parsed.value, path);
  return jsonOk();
});
