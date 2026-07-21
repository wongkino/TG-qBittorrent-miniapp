"use client";

import { useCallback, useEffect, useState } from "react";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { I18nProvider, useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QbDashboard } from "@/components/QbDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchSnapshot } from "@/lib/client-api";
import type { ClientAuth } from "@/lib/client-auth";
import { DEV_PREVIEW_BEARER } from "@/lib/dev/preview";
import {
  clearStoredGoogleCredential,
  getStoredGoogleCredential,
  isStandaloneWebApp,
  readEmailFromIdToken,
  storeGoogleCredential,
} from "@/lib/webapp";

const DEV_PREVIEW =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_PREVIEW === "1";

function errMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function HeaderTools() {
  return (
    <div className="header__actions">
      <LanguageToggle />
      <ThemeToggle />
    </div>
  );
}

export function WebApp() {
  return (
    <I18nProvider>
      <WebAppInner />
    </I18nProvider>
  );
}

function WebAppInner() {
  const { t } = useI18n();
  const [auth, setAuth] = useState<ClientAuth | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  const connectWithGoogleCredential = useCallback(async (credential: string) => {
    const session: ClientAuth = { token: credential };
    await fetchSnapshot(session);
    storeGoogleCredential(credential);
    setAuth(session);
    setUserName(readEmailFromIdToken(credential));
    setNeedsSignIn(false);
    setAuthError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        setStandalone(isStandaloneWebApp());

        if (DEV_PREVIEW) {
          await connectWithGoogleCredential(DEV_PREVIEW_BEARER);
          setUserName(t("app.previewUser"));
          return;
        }

        const stored = getStoredGoogleCredential();
        if (stored) {
          try {
            await connectWithGoogleCredential(stored);
            return;
          } catch {
            clearStoredGoogleCredential();
          }
        }

        setNeedsSignIn(true);
      } catch (err) {
        if (!cancelled) {
          setAuthError(errMessage(err, t("webapp.signInFailed")));
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [connectWithGoogleCredential, t]);

  if (booting) {
    return (
      <main className="shell">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
          <HeaderTools />
        </header>
        <p className="status">{t("app.loading")}</p>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="shell">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
          <HeaderTools />
        </header>
        <p className="error">{authError}</p>
      </main>
    );
  }

  if (!auth && needsSignIn) {
    return (
      <main className="shell">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
          <HeaderTools />
        </header>
        <GoogleSignIn
          standalone={standalone}
          onCredential={(credential) => {
            void connectWithGoogleCredential(credential).catch((err) => {
              setAuthError(errMessage(err, t("webapp.signInFailed")));
            });
          }}
        />
      </main>
    );
  }

  if (!auth) {
    return null;
  }

  return <QbDashboard auth={auth} userName={userName} />;
}
