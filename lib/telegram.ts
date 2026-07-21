import { createHmac, timingSafeEqual } from "crypto";
import { isDevPreviewInitData } from "@/lib/dev/preview";
import { env, parseAllowedTelegramUserIds } from "@/lib/env";

type TelegramWebAppUser = { id: number };

export type VerifiedTelegramAuth = {
  user: TelegramWebAppUser;
  authDate: number;
  /** True only for local `DEV_PREVIEW` (never in production). */
  preview?: boolean;
};

const MAX_AUTH_AGE_SECONDS = 60 * 60 * 24;

function getBotToken(): string {
  const token = env("TELEGRAM_BOT_TOKEN");
  if (!token) throw new AuthError("TELEGRAM_BOT_TOKEN is not configured", 500);
  return token;
}

function extractInitData(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^tma\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/** https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app */
function validateInitData(initData: string): VerifiedTelegramAuth {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) throw new AuthError("Missing hash in initData", 401);

  const pairs = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .map(([key, value]) => `${key}=${value}`)
    .sort();

  const secretKey = createHmac("sha256", "WebAppData")
    .update(getBotToken())
    .digest();
  const calculatedHash = createHmac("sha256", secretKey)
    .update(pairs.join("\n"))
    .digest("hex");

  const hashBuf = Buffer.from(hash, "hex");
  const calcBuf = Buffer.from(calculatedHash, "hex");
  if (hashBuf.length !== calcBuf.length || !timingSafeEqual(hashBuf, calcBuf)) {
    throw new AuthError("Invalid initData signature", 401);
  }

  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) {
    throw new AuthError("Missing auth_date", 401);
  }
  if (Math.floor(Date.now() / 1000) - authDate > MAX_AUTH_AGE_SECONDS) {
    throw new AuthError("initData expired", 401);
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new AuthError("Missing user in initData", 401);

  let user: TelegramWebAppUser;
  try {
    user = JSON.parse(userRaw) as TelegramWebAppUser;
  } catch {
    throw new AuthError("Invalid user payload", 401);
  }
  if (!user?.id || typeof user.id !== "number") {
    throw new AuthError("Invalid user id", 401);
  }

  const allowed = parseAllowedTelegramUserIds();
  if (allowed.length === 0) {
    throw new AuthError("ALLOWED_TELEGRAM_USER_IDS is not configured", 500);
  }
  if (!allowed.includes(user.id)) throw new AuthError("User not allowed", 403);

  return { user, authDate };
}

export function requireTelegramAuth(
  authorizationHeader: string | null
): VerifiedTelegramAuth {
  const initData = extractInitData(authorizationHeader);
  if (!initData) {
    throw new AuthError("Missing Authorization: tma <initData>", 401);
  }
  if (isDevPreviewInitData(initData)) {
    return {
      user: { id: 0 },
      authDate: Math.floor(Date.now() / 1000),
      preview: true,
    };
  }
  return validateInitData(initData);
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
