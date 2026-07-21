import { createRemoteJWKSet, jwtVerify } from "jose";
import { env, parseAllowedGoogleEmails } from "@/lib/env";
import { AuthError } from "@/lib/telegram";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

export type GoogleIdentity = {
  email: string;
  sub: string;
};

/** Stable numeric id for locale KV (Telegram user ids are also numeric). */
export function googleSubToUserId(sub: string): number {
  let hash = 2166136261;
  for (let i = 0; i < sub.length; i++) {
    hash ^= sub.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

export async function verifyGoogleIdToken(token: string): Promise<GoogleIdentity> {
  const clientId = env("GOOGLE_CLIENT_ID");
  if (!clientId) {
    throw new AuthError("GOOGLE_CLIENT_ID is not configured", 500);
  }

  let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
  try {
    const verified = await jwtVerify(token, JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });
    payload = verified.payload;
  } catch {
    throw new AuthError("Invalid Google ID token", 401);
  }

  const email = payload.email;
  if (typeof email !== "string" || !email.trim()) {
    throw new AuthError("Missing email in Google token", 401);
  }
  if (!payload.email_verified) {
    throw new AuthError("Google email not verified", 403);
  }

  const sub = payload.sub;
  if (!sub) throw new AuthError("Missing sub in Google token", 401);

  const allowed = parseAllowedGoogleEmails();
  if (allowed.length === 0) {
    throw new AuthError("ALLOWED_GOOGLE_EMAILS is not configured", 500);
  }
  if (!allowed.includes(email.trim().toLowerCase())) {
    throw new AuthError("User not allowed", 403);
  }

  return { email: email.trim(), sub };
}
