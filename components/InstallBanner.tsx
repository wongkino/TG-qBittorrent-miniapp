"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { ClearIcon } from "@/components/icons";
import {
  dismissInstallBanner,
  isAppleTouchDevice,
  shouldOfferInstall,
} from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    if (!shouldOfferInstall()) return;

    setIos(isAppleTouchDevice());
    setVisible(true);

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIos(false);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  if (!visible) return null;

  function close() {
    dismissInstallBanner();
    setVisible(false);
    setDeferred(null);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    close();
  }

  return (
    <div className="install-banner" role="status">
      <div className="install-banner__body">
        <p className="install-banner__title">{t("pwa.installTitle")}</p>
        <p className="install-banner__hint">
          {ios ? t("pwa.installHintIos") : t("pwa.installHint")}
        </p>
      </div>
      <div className="install-banner__actions">
        {deferred ? (
          <button
            type="button"
            className="btn btn--sm btn--primary"
            onClick={() => void install()}
          >
            {t("pwa.installAction")}
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn--icon btn--sm"
          aria-label={t("pwa.installDismiss")}
          title={t("pwa.installDismiss")}
          onClick={close}
        >
          <ClearIcon size={16} />
        </button>
      </div>
    </div>
  );
}
