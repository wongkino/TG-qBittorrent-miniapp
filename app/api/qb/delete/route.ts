import { NextResponse } from "next/server";
import { handleApiError, jsonError, requireAuth } from "@/lib/api";
import { deleteTorrents } from "@/lib/qbittorrent";

export async function POST(request: Request) {
  try {
    requireAuth(request);
    const body = (await request.json()) as {
      hashes?: string;
      deleteFiles?: boolean;
    };
    if (!body.hashes?.trim()) {
      return jsonError("hashes is required", 400);
    }
    await deleteTorrents(body.hashes.trim(), Boolean(body.deleteFiles));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
