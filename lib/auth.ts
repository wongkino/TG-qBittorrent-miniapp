import { createHash, timingSafeEqual } from "crypto";
import { env, parseAllowedTelegramUserIds } from "@/lib/env";
import {
  AuthError,
  requireTelegramAuth,
  type VerifiedTelegramAuth,
} from "@/lib/telegram";

export type VerifiedAuth = VerifiedTelegramAuth & { webApp?: boolean };

function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function validateWebAppToken(token: string): VerifiedAuth {
  const expected = env("WEB_APP_TOKEN");
  if (!expected) {
    throw new AuthError("WEB_APP_TOKEN is not configured", 500);
  }

  const provided = createHash("sha256").update(token).digest();
  const target = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(provided, target)) {
    throw new AuthError("Invalid web app token", 401);
  }

  const allowed = parseAllowedTelegramUserIds();
  if (allowed.length === 0) {
    throw new AuthError("ALLOWED_TELEGRAM_USER_IDS is not configured", 500);
  }

  return {
    user: { id: allowed[0] },
    authDate: Math.floor(Date.now() / 1000),
    webApp: true,
  };
}

export function requireAuth(request: Request): VerifiedAuth {
  const header = request.headers.get("authorization");
  const bearer = extractBearerToken(header);
  if (bearer) return validateWebAppToken(bearer);
  return requireTelegramAuth(header);
}
