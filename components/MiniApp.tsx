"use client";

import { useEffect, useState } from "react";
import { I18nProvider, useI18n } from "@/components/I18nProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { QbDashboard } from "@/components/QbDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { ClientAuth } from "@/lib/client-auth";
import { DEV_PREVIEW_INIT_DATA } from "@/lib/dev/preview";
import { fetchSnapshot } from "@/lib/client-api";

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

export function MiniApp() {
  return (
    <I18nProvider>
      <MiniAppInner />
    </I18nProvider>
  );
}

function MiniAppInner() {
  const { t } = useI18n();
  const [auth, setAuth] = useState<ClientAuth | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const { default: WebApp } = await import("@twa-dev/sdk");
        if (cancelled) return;

        WebApp.ready();
        WebApp.expand();

        const data = WebApp.initData;
        if (!data) {
          if (DEV_PREVIEW) {
            const session: ClientAuth = {
              mode: "tma",
              initData: DEV_PREVIEW_INIT_DATA,
            };
            setAuth(session);
            setUserName(t("app.previewUser"));
            await fetchSnapshot(session);
            return;
          }
          setAuthError(t("app.noInitData"));
          return;
        }

        const session: ClientAuth = { mode: "tma", initData: data };
        const user = WebApp.initDataUnsafe.user;
        setAuth(session);
        setUserName(
          user?.first_name || user?.username || (user ? String(user.id) : null)
        );
        await fetchSnapshot(session);
      } catch (err) {
        if (cancelled) return;
        if (DEV_PREVIEW) {
          try {
            const session: ClientAuth = {
              mode: "tma",
              initData: DEV_PREVIEW_INIT_DATA,
            };
            setAuth(session);
            setUserName(t("app.previewUser"));
            await fetchSnapshot(session);
            return;
          } catch (previewErr) {
            setAuthError(
              errMessage(previewErr, t("app.previewInitFailed"))
            );
            return;
          }
        }
        setAuthError(errMessage(err, t("app.initFailed")));
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional single boot
  }, []);

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

  if (authError || !auth) {
    return (
      <main className="shell">
        <header className="header">
          <h1 className="title">qBittorrent</h1>
          <HeaderTools />
        </header>
        <p className="error">{authError ?? t("app.unauthorized")}</p>
      </main>
    );
  }

  return <QbDashboard auth={auth} userName={userName} />;
}
