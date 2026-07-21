import { useCallback, useEffect, useState } from "react";
import { I18nProvider, useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QbDashboard } from "@/components/QbDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WebAppUnlock } from "@/components/WebAppUnlock";
import { fetchSnapshot } from "@/lib/client-api";
import type { ClientAuth } from "@/lib/client-auth";
import {
  clearStoredWebAppToken,
  getStoredWebAppToken,
  isStandaloneWebApp,
  storeWebAppToken,
} from "@/lib/webapp";

const DEV_TOKEN = import.meta.env.VITE_WEB_APP_TOKEN?.trim() || "";

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

export function App() {
  return (
    <I18nProvider>
      <WebAppRoot />
    </I18nProvider>
  );
}

function WebAppRoot() {
  const { t } = useI18n();
  const [auth, setAuth] = useState<ClientAuth | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [booting, setBooting] = useState(true);

  const connectWithWebAppToken = useCallback(
    async (token: string) => {
      const session: ClientAuth = { mode: "bearer", token };
      await fetchSnapshot(session);
      storeWebAppToken(token);
      setAuth(session);
      setNeedsUnlock(false);
      setAuthError(null);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        setStandalone(isStandaloneWebApp());

        if (import.meta.env.DEV && DEV_TOKEN) {
          await connectWithWebAppToken(DEV_TOKEN);
          return;
        }

        const storedToken = getStoredWebAppToken();
        if (storedToken) {
          try {
            await connectWithWebAppToken(storedToken);
            return;
          } catch {
            clearStoredWebAppToken();
          }
        }

        setNeedsUnlock(true);
      } catch (err) {
        if (!cancelled) {
          setAuthError(errMessage(err, t("webapp.unlockFailed")));
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [connectWithWebAppToken, t]);

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

  if (!auth && needsUnlock) {
    return (
      <main className="shell">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
          <HeaderTools />
        </header>
        <WebAppUnlock
          standalone={standalone}
          onUnlock={connectWithWebAppToken}
        />
      </main>
    );
  }

  if (!auth) {
    return null;
  }

  return <QbDashboard auth={auth} userName={t("webapp.user")} />;
}
