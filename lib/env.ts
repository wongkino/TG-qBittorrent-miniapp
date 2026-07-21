/** Read a trimmed env var; empty string becomes undefined. */
export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function parseAllowedGoogleEmails(): string[] {
  return (env("ALLOWED_GOOGLE_EMAILS") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
