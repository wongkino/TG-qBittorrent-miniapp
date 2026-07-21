import { NextResponse } from "next/server";
import { type VerifiedAuth } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { QBitError } from "@/lib/qbittorrent";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk(data: Record<string, unknown> = { ok: true }) {
  return NextResponse.json(data);
}

export { requireAuth } from "@/lib/auth";

/** Local DEV_PREVIEW: skip qBittorrent and return mock / no-op. */
export function previewResponse(
  auth: VerifiedAuth,
  data?: Record<string, unknown>
) {
  if (!auth.preview) return null;
  return jsonOk(data ?? { ok: true });
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
