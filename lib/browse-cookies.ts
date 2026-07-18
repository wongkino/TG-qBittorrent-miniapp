/** Merge Set-Cookie name=value pairs into a request Cookie header. */
export function mergeCookieHeader(
  existing: string,
  setCookieHeaders: string[]
): string {
  const map = new Map<string, string>();
  for (const part of existing.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  for (const sc of setCookieHeaders) {
    const first = sc.split(";")[0]?.trim();
    if (!first) continue;
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    map.set(first.slice(0, eq), first.slice(eq + 1));
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}
