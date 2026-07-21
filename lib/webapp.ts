const CREDENTIAL_KEY = "tg-dl-google-credential";

export function isStandaloneWebApp(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function getStoredGoogleCredential(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CREDENTIAL_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function storeGoogleCredential(credential: string): void {
  localStorage.setItem(CREDENTIAL_KEY, credential.trim());
}

export function clearStoredGoogleCredential(): void {
  localStorage.removeItem(CREDENTIAL_KEY);
}

/** Read email from Google ID token payload (display only; server verifies). */
export function readEmailFromIdToken(token: string): string | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { email?: string };
    return typeof payload.email === "string" ? payload.email : null;
  } catch {
    return null;
  }
}
