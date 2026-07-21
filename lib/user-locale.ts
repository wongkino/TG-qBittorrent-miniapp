import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/lib/i18n";

const memoryLocales = new Map<string, Locale>();

function localeKey(userId: number): string {
  return `locale:${userId}`;
}

type PrefsKv = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

async function getPrefsKv(): Promise<PrefsKv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const kv = (env as { USER_PREFS?: PrefsKv }).USER_PREFS;
    return kv ?? null;
  } catch {
    return null;
  }
}

export async function getUserLocale(userId: number): Promise<Locale> {
  const key = localeKey(userId);
  const kv = await getPrefsKv();
  if (kv) {
    try {
      const value = await kv.get(key);
      if (isLocale(value)) {
        memoryLocales.set(key, value);
        return value;
      }
    } catch (err) {
      console.error("getUserLocale KV failed", err);
    }
  }
  return memoryLocales.get(key) ?? DEFAULT_LOCALE;
}

export async function setUserLocale(
  userId: number,
  locale: Locale
): Promise<void> {
  const key = localeKey(userId);
  memoryLocales.set(key, locale);
  const kv = await getPrefsKv();
  if (!kv) return;
  try {
    await kv.put(key, locale);
  } catch (err) {
    console.error("setUserLocale KV failed", err);
  }
}
