import { jsonOk, readRequiredString, withAuth } from "@/lib/api";
import { markRssArticleRead } from "@/lib/qbittorrent";

export const POST = withAuth(async (request) => {
  const parsed = await readRequiredString(request, "path");
  if (parsed instanceof Response) return parsed;
  const articleId =
    typeof parsed.body.articleId === "string"
      ? parsed.body.articleId.trim() || undefined
      : undefined;
  await markRssArticleRead(parsed.value, articleId);
  return jsonOk();
});
