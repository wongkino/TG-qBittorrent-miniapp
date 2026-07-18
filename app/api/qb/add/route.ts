import { NextResponse } from "next/server";
import { handleApiError, jsonError, requireAuth } from "@/lib/api";
import { addTorrent } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = (await request.json()) as { urls?: string };
    const urls = body.urls?.trim();
    if (!urls) {
      return jsonError("urls is required", 400);
    }
    await addTorrent(urls);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
