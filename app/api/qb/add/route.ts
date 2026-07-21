import { jsonOk, readRequiredString, withAuth } from "@/lib/api";
import { addTorrent } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readRequiredString(request, "urls");
  if (parsed instanceof Response) return parsed;
  const category =
    typeof parsed.body.category === "string"
      ? parsed.body.category.trim() || undefined
      : undefined;
  await addTorrent(parsed.value, category);
  return jsonOk();
});
