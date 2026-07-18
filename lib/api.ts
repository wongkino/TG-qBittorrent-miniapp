import { NextResponse } from "next/server";
import { AuthError, requireTelegramAuth } from "@/lib/telegram";
import { QBitError } from "@/lib/qbittorrent";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function requireAuth(request: Request) {
  return requireTelegramAuth(request.headers.get("authorization"));
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) {
    return jsonError(err.message, err.status);
  }
  if (err instanceof QBitError) {
    return jsonError(err.message, err.status);
  }
  console.error(err);
  return jsonError("Internal server error", 500);
}
