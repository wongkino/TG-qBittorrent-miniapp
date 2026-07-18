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

const MAX_AUTH_AGE_SECONDS = 60 * 60 * 24;

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new AuthError("TELEGRAM_BOT_TOKEN is not configured", 500);
  return token;
}

function getAllowedUserIds(): Set<number> {
  return new Set(
    (process.env.ALLOWED_TELEGRAM_USER_IDS ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
  );
}

export function extractInitData(
  authorizationHeader: string | null
): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^tma\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/** https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app */
export function validateInitData(initData: string): VerifiedTelegramAuth {
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

  const allowed = getAllowedUserIds();
  if (allowed.size === 0) {
    throw new AuthError("ALLOWED_TELEGRAM_USER_IDS is not configured", 500);
  }
  if (!allowed.has(user.id)) throw new AuthError("User not allowed", 403);

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
