import { handleApiError, jsonError } from "@/lib/api";
import {
  assertBrowsableUrl,
  BrowseError,
  fetchBrowsableHtml,
} from "@/lib/browse-proxy";
import { AuthError, requireTelegramAuth } from "@/lib/telegram";

export async function GET(request: Request) {
  try {
    requireTelegramAuth(request.headers.get("authorization"));

    const urlParam = new URL(request.url).searchParams.get("url")?.trim();
    if (!urlParam) return jsonError("url is required", 400);

    const target = assertBrowsableUrl(urlParam);
    const html = await fetchBrowsableHtml(target);

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    if (err instanceof BrowseError) {
      return jsonError(err.message, err.status);
    }
    if (err instanceof AuthError) {
      return jsonError(err.message, err.status);
    }
    return handleApiError(err);
  }
}
