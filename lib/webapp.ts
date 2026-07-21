const TOKEN_KEY = "tg-dl-webapp-token";

export function isStandaloneWebApp(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function getStoredWebAppToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(TOKEN_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function storeWebAppToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

export function clearStoredWebAppToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
