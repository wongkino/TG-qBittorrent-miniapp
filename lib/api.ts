import { NextResponse } from "next/server";
import { AuthError, requireAuth, type VerifiedAuth } from "@/lib/auth";
import { QBitError } from "@/lib/qbittorrent";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk(data: Record<string, unknown> = { ok: true }) {
  return NextResponse.json(data);
}

export { requireAuth };

/** Local DEV_PREVIEW: skip qBittorrent and return mock / no-op. */
export function previewResponse(
  auth: VerifiedAuth,
  data?: Record<string, unknown>
) {
  if (!auth.preview) return null;
  return jsonOk(data ?? { ok: true });
}

type AuthHandler = (
  request: Request,
  auth: VerifiedAuth
) => Promise<Response> | Response;

type PreviewData =
  | Record<string, unknown>
  | (() => Record<string, unknown>)
  | undefined;

/**
 * Shared shell for `/api/qb/*`: requireAuth → optional preview → handler → errors.
 */
export function withAuth(handler: AuthHandler, previewData?: PreviewData) {
  return async (request: Request) => {
    try {
      const auth = await requireAuth(request);
      const data =
        typeof previewData === "function" ? previewData() : previewData;
      const preview = previewResponse(auth, data);
      if (preview) return preview;
      return await handler(request, auth);
    } catch (err) {
      return handleApiError(err);
    }
  };
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

/** Parse JSON body and require a non-empty string field. */
export async function readRequiredString(
  request: Request,
  key: string
): Promise<{ value: string; body: Record<string, unknown> } | Response> {
  const body = (await request.json()) as Record<string, unknown>;
  const raw = body[key];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return jsonError(`${key} is required`, 400);
  return { value, body };
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError || err instanceof QBitError) {
    return jsonError(err.message, err.status);
  }
  console.error(err);
  return jsonError("Internal server error", 500);
}
