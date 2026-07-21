import { useEffect, useRef } from "react";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  standalone: boolean;
  onCredential: (credential: string) => void;
};

export function GoogleSignIn({ standalone, onCredential }: Props) {
  const { t } = useI18n();
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;

    let cancelled = false;

    function init() {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) onCredential(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 280,
      });
    }

    if (window.google?.accounts?.id) {
      init();
      return () => {
        cancelled = true;
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential]);

  return (
    <section className="webapp-unlock">
      <h2 className="webapp-unlock__title">{t("webapp.title")}</h2>
      <p className="webapp-unlock__hint">
        {standalone ? t("webapp.hintStandalone") : t("webapp.hintBrowser")}
      </p>
      {clientId ? (
        <div className="webapp-unlock__google">
          <div ref={buttonRef} />
        </div>
      ) : (
        <p className="error">{t("webapp.missingClientId")}</p>
      )}
      <p className="webapp-unlock__footer">{t("webapp.footer")}</p>
    </section>
  );
}
