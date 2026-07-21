/** Read a trimmed env var; empty string becomes undefined. */
export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function parseAllowedTelegramUserIds(): number[] {
  return (env("ALLOWED_TELEGRAM_USER_IDS") ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
}

export function parseAllowedGoogleEmails(): string[] {
  return (env("ALLOWED_GOOGLE_EMAILS") ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
