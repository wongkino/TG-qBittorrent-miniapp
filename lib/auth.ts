import {
  googleSubToUserId,
  verifyGoogleIdToken,
} from "@/lib/google-auth";
import {
  AuthError,
  requireTelegramAuth,
  type VerifiedTelegramAuth,
} from "@/lib/telegram";

export type VerifiedAuth = VerifiedTelegramAuth & {
  webApp?: boolean;
  google?: boolean;
  email?: string;
};

function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireAuth(request: Request): Promise<VerifiedAuth> {
  const header = request.headers.get("authorization");
  const bearer = extractBearerToken(header);
  if (bearer) {
    const { email, sub } = await verifyGoogleIdToken(bearer);
    return {
      user: { id: googleSubToUserId(sub) },
      authDate: Math.floor(Date.now() / 1000),
      webApp: true,
      google: true,
      email,
    };
  }
  return requireTelegramAuth(header);
}

export { AuthError };
