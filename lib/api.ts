import { NextResponse } from "next/server";
import { AuthError, requireTelegramAuth } from "@/lib/telegram";
import { QBitError } from "@/lib/qbittorrent";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk(data: Record<string, unknown> = { ok: true }) {
  return NextResponse.json(data);
}

export function requireAuth(request: Request) {
  return requireTelegramAuth(request.headers.get("authorization"));
}

/** Parse JSON body and require a non-empty `hashes` field. */
export async function readHashesBody<T extends { hashes?: string }>(
  request: Request
): Promise<{ hashes: string; body: T } | Response> {
  const body = (await request.json()) as T;
  const hashes = body.hashes?.trim();
  if (!hashes) return jsonError("hashes is required", 400);
  return { hashes, body };
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError || err instanceof QBitError) {
    return jsonError(err.message, err.status);
  }
  console.error(err);
  return jsonError("Internal server error", 500);
}
