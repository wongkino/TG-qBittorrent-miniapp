import { AuthSessionError } from "@/lib/client-auth";
import { isProbablyOfflineError } from "@/lib/pwa";

export function errMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function isAuthExpired(err: unknown): boolean {
  return err instanceof AuthSessionError;
}

export type ClientErrorKind = "auth" | "offline" | "other";

export function classifyClientError(err: unknown): ClientErrorKind {
  if (isAuthExpired(err)) return "auth";
  if (isProbablyOfflineError(err)) return "offline";
  return "other";
}
