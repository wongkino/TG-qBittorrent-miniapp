/** Google OAuth client id for the iOS Web App sign-in button (public). */
export function getGoogleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
}
