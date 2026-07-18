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

    const cookieHeader = request.headers.get("x-browse-cookie") ?? undefined;
    const target = assertBrowsableUrl(urlParam);
    const result = await fetchBrowsableHtml(target, cookieHeader);

    const headers = new Headers({
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Browse-Final-Url": result.finalUrl,
    });
    if (result.setCookies.length > 0) {
      headers.set(
        "X-Browse-Set-Cookie",
        Buffer.from(JSON.stringify(result.setCookies), "utf8").toString("base64")
      );
    }

    return new Response(result.html, { status: 200, headers });
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
