"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/components/I18nProvider";
import { getGoogleClientId } from "@/lib/google-client-id";

type Props = {
  standalone: boolean;
  onCredential: (credential: string) => void;
};

export function GoogleSignIn({ standalone, onCredential }: Props) {
  const { t } = useI18n();
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = getGoogleClientId();

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
    <section className="sign-in">
      <h2 className="sign-in__title">{t("signIn.title")}</h2>
      <p className="sign-in__hint">
        {standalone ? t("signIn.hintStandalone") : t("signIn.hintBrowser")}
      </p>
      {clientId ? (
        <div className="sign-in__google">
          <div ref={buttonRef} />
        </div>
      ) : (
        <p className="error">{t("signIn.missingClientId")}</p>
      )}
      <p className="sign-in__footer">{t("signIn.footer")}</p>
    </section>
  );
}
