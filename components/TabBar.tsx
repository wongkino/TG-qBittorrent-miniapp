"use client";

import { useI18n } from "@/components/I18nProvider";
import {
  DownloadIcon,
  EllipsisIcon,
  RssIcon,
} from "@/components/icons";

export type AppTab = "downloads" | "rss";

type Props = {
  tab: AppTab;
  moreOpen: boolean;
  onTabChange: (tab: AppTab) => void;
  onMore: () => void;
};

export function TabBar({ tab, moreOpen, onTabChange, onMore }: Props) {
  const { t } = useI18n();

  return (
    <nav className="tab-bar" aria-label={t("app.nav")}>
      <button
        type="button"
        className={`tab-bar__item${tab === "downloads" && !moreOpen ? " tab-bar__item--active" : ""}`}
        onClick={() => onTabChange("downloads")}
        aria-current={tab === "downloads" && !moreOpen ? "page" : undefined}
      >
        <DownloadIcon size={22} />
        <span>{t("app.tab.downloads")}</span>
      </button>
      <button
        type="button"
        className={`tab-bar__item${tab === "rss" && !moreOpen ? " tab-bar__item--active" : ""}`}
        onClick={() => onTabChange("rss")}
        aria-current={tab === "rss" && !moreOpen ? "page" : undefined}
      >
        <RssIcon size={22} />
        <span>{t("app.tab.rss")}</span>
      </button>
      <button
        type="button"
        className={`tab-bar__item${moreOpen ? " tab-bar__item--active" : ""}`}
        onClick={onMore}
        aria-expanded={moreOpen}
      >
        <EllipsisIcon size={22} />
        <span>{t("app.tab.more")}</span>
      </button>
    </nav>
  );
}
