import { NextResponse } from "next/server";
import { handleApiError, requireAuth } from "@/lib/api";
import { listTorrents } from "@/lib/qbittorrent";

export async function GET(request: Request) {
  try {
    requireAuth(request);
    const torrents = await listTorrents();
    return NextResponse.json({ torrents });
  } catch (err) {
    return handleApiError(err);
  }
}
