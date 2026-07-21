"use client";

import { EmptyState } from "@/components/EmptyState";
import { useI18n } from "@/components/I18nProvider";
import { InboxIcon } from "@/components/icons";

type Props = {
  onRetry?: () => void;
};

export function OfflineState({ onRetry }: Props) {
  const { t } = useI18n();
  return (
    <EmptyState
      icon={<InboxIcon size={28} />}
      title={t("pwa.offlineTitle")}
      hint={t("pwa.offlineHint")}
      action={
        onRetry ? (
          <button
            type="button"
            className="btn btn--primary empty__action"
            onClick={onRetry}
          >
            {t("app.refresh")}
          </button>
        ) : null
      }
    />
  );
}
