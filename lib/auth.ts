import {
  verifyGoogleIdToken,
} from "@/lib/google-auth";
import { isDevPreviewBearer } from "@/lib/dev/preview";

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export type VerifiedAuth = {
  authDate: number;
  preview?: boolean;
  google?: boolean;
  email?: string;
};

function extractBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireAuth(request: Request): Promise<VerifiedAuth> {
  const bearer = extractBearerToken(request.headers.get("authorization"));
  if (!bearer) {
    throw new AuthError("Missing Authorization: Bearer <token>", 401);
  }

  if (isDevPreviewBearer(bearer)) {
    return {
      authDate: Math.floor(Date.now() / 1000),
      preview: true,
    };
  }

  const { email } = await verifyGoogleIdToken(bearer);
  return {
    authDate: Math.floor(Date.now() / 1000),
    google: true,
    email,
  };
}
