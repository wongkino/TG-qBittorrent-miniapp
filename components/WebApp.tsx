"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { I18nProvider, useI18n } from "@/components/I18nProvider";
import { InstallBanner } from "@/components/InstallBanner";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LoadingState } from "@/components/LoadingState";
import {
  QbDashboard,
  type SnapshotData,
} from "@/components/QbDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchSnapshot } from "@/lib/client-api";
import type { ClientAuth } from "@/lib/client-auth";
import { errMessage } from "@/lib/client-errors";
import { DEV_PREVIEW_BEARER } from "@/lib/dev/preview";
import {
  clearStoredGoogleCredential,
  getStoredGoogleCredential,
  isStandaloneWebApp,
  readEmailFromIdToken,
  storeGoogleCredential,
} from "@/lib/google-session";

const DEV_PREVIEW =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_PREVIEW === "1";

function HeaderTools() {
  return (
    <div className="header__actions">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
}

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="shell">
      <header className="header">
        <h1 className="title">qBittorrent</h1>
        <HeaderTools />
      </header>
      {children}
    </main>
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
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [standalone] = useState(
    () => typeof window !== "undefined" && isStandaloneWebApp()
  );
  const [userName, setUserName] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  const handleAuthExpired = useCallback(() => {
    clearStoredGoogleCredential();
    setAuth(null);
    setSnapshot(null);
    setNeedsSignIn(true);
    setUserName(null);
    setAuthError(null);
  }, []);

  const connectWithGoogleCredential = useCallback(async (credential: string) => {
    const session: ClientAuth = { token: credential };
    const next = await fetchSnapshot(session);
    storeGoogleCredential(credential);
    setSnapshot(next);
    setAuth(session);
    setUserName(readEmailFromIdToken(credential));
    setNeedsSignIn(false);
    setAuthError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        if (DEV_PREVIEW) {
          await connectWithGoogleCredential(DEV_PREVIEW_BEARER);
          if (!cancelled) setUserName(t("app.previewUser"));
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

        if (!cancelled) setNeedsSignIn(true);
      } catch (err) {
        if (!cancelled) {
          setAuthError(errMessage(err, t("signIn.failed")));
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
      <AuthShell>
        <LoadingState />
      </AuthShell>
    );
  }

  if (authError) {
    return (
      <AuthShell>
        <p className="error">{authError}</p>
      </AuthShell>
    );
  }

  if (!auth && needsSignIn) {
    return (
      <AuthShell>
        <GoogleSignIn
          standalone={standalone}
          onCredential={(credential) => {
            void connectWithGoogleCredential(credential).catch((err) => {
              setAuthError(errMessage(err, t("signIn.failed")));
            });
          }}
        />
        <InstallBanner />
      </AuthShell>
    );
  }

  if (!auth) return null;

  return (
    <QbDashboard
      auth={auth}
      userName={userName}
      initialSnapshot={snapshot}
      onAuthExpired={handleAuthExpired}
    />
  );
}
