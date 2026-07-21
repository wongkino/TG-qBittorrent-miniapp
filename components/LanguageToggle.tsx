"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import {
  LOCALES,
  LOCALE_NATIVE_LABEL,
  LOCALE_SHORT_LABEL,
  type Locale,
} from "@/lib/i18n";

type Props = {
  className?: string;
};

export function LanguageToggle({ className }: Props) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const ac = new AbortController();
    const { signal } = ac;

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (
          event.target instanceof Node &&
          !rootRef.current?.contains(event.target)
        ) {
          setOpen(false);
        }
      },
      { signal }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") setOpen(false);
      },
      { signal }
    );

    return () => ac.abort();
  }, [open]);

  function choose(next: Locale) {
    if (next !== locale) setLocale(next);
    setOpen(false);
  }

  const currentLabel = LOCALE_NATIVE_LABEL[locale];

  return (
    <div className="lang-menu" ref={rootRef}>
      <button
        type="button"
        className={className ?? "btn btn--icon btn--lang"}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={currentLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        title={currentLabel}
      >
        <span className="btn--lang__label">{LOCALE_SHORT_LABEL[locale]}</span>
      </button>

      {open ? (
        <ul
          id={menuId}
          className="lang-menu__list"
          role="listbox"
          aria-label="Language"
        >
          {LOCALES.map((item) => {
            const selected = item === locale;
            const label = LOCALE_NATIVE_LABEL[item];
            return (
              <li key={item} role="presentation">
                <button
                  type="button"
                  role="option"
                  className={
                    selected
                      ? "lang-menu__option lang-menu__option--active"
                      : "lang-menu__option"
                  }
                  aria-label={label}
                  aria-selected={selected}
                  title={label}
                  onClick={() => choose(item)}
                >
                  {LOCALE_SHORT_LABEL[item]}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
