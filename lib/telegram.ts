import { createHmac, timingSafeEqual } from "crypto";

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type VerifiedTelegramAuth = {
  user: TelegramWebAppUser;
  authDate: number;
};

const MAX_AUTH_AGE_SECONDS = 60 * 60 * 24; // 24 hours

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  return token;
}

function getAllowedUserIds(): Set<number> {
  const raw = process.env.ALLOWED_TELEGRAM_USER_IDS ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
  return new Set(ids);
}

export function extractInitData(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^tma\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/**
 * Validates Telegram Mini App initData per official WebApp docs.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData: string): VerifiedTelegramAuth {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new AuthError("Missing hash in initData", 401);
  }

  const pairs: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === "hash") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  const botToken = getBotToken();
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const hashBuf = Buffer.from(hash, "hex");
  const calcBuf = Buffer.from(calculatedHash, "hex");
  if (hashBuf.length !== calcBuf.length || !timingSafeEqual(hashBuf, calcBuf)) {
    throw new AuthError("Invalid initData signature", 401);
  }

  const authDateRaw = params.get("auth_date");
  const authDate = authDateRaw ? Number(authDateRaw) : NaN;
  if (!Number.isFinite(authDate)) {
    throw new AuthError("Missing auth_date", 401);
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > MAX_AUTH_AGE_SECONDS) {
    throw new AuthError("initData expired", 401);
  }

  const userRaw = params.get("user");
  if (!userRaw) {
    throw new AuthError("Missing user in initData", 401);
  }

  let user: TelegramWebAppUser;
  try {
    user = JSON.parse(userRaw) as TelegramWebAppUser;
  } catch {
    throw new AuthError("Invalid user payload", 401);
  }

  if (!user?.id || typeof user.id !== "number") {
    throw new AuthError("Invalid user id", 401);
  }

  const allowed = getAllowedUserIds();
  if (allowed.size === 0) {
    throw new AuthError("ALLOWED_TELEGRAM_USER_IDS is not configured", 500);
  }
  if (!allowed.has(user.id)) {
    throw new AuthError("User not allowed", 403);
  }

  return { user, authDate };
}

export function requireTelegramAuth(
  authorizationHeader: string | null
): VerifiedTelegramAuth {
  const initData = extractInitData(authorizationHeader);
  if (!initData) {
    throw new AuthError("Missing Authorization: tma <initData>", 401);
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
