"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  standalone: boolean;
  onUnlock: (token: string) => Promise<void>;
};

export function WebAppUnlock({ standalone, onUnlock }: Props) {
  const { t } = useI18n();
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = token.trim();
    if (!value) return;

    setSubmitting(true);
    setError(null);
    try {
      await onUnlock(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("webapp.unlockFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="webapp-unlock">
      <h2 className="webapp-unlock__title">{t("webapp.title")}</h2>
      <p className="webapp-unlock__hint">
        {standalone ? t("webapp.hintStandalone") : t("webapp.hintBrowser")}
      </p>
      <form className="webapp-unlock__form" onSubmit={handleSubmit}>
        <label className="webapp-unlock__label" htmlFor="webapp-token">
          {t("webapp.tokenLabel")}
        </label>
        <input
          id="webapp-token"
          className="webapp-unlock__input"
          type="password"
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={t("webapp.tokenPlaceholder")}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={submitting}
        />
        {error ? <p className="error">{error}</p> : null}
        <button
          type="submit"
          className="btn btn--primary webapp-unlock__submit"
          disabled={submitting || !token.trim()}
        >
          {submitting ? t("webapp.unlocking") : t("webapp.unlock")}
        </button>
      </form>
      <p className="webapp-unlock__footer">{t("webapp.footer")}</p>
    </section>
  );
}
