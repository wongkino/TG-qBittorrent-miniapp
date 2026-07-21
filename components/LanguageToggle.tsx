"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/I18nProvider";
import {
  LOCALES,
  LOCALE_NATIVE_LABEL,
  LOCALE_SHORT_LABEL,
  type Locale,
} from "@/lib/i18n";

type Props = {
  className?: string;
  /** Menu opens relative to the trigger. Default: down. */
  placement?: "up" | "down" | "right";
};

type MenuPos = {
  left: number;
  top: number;
};

export function LanguageToggle({ className, placement = "down" }: Props) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setPos(null);
      return;
    }

    function update() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (placement === "right") {
        setPos({
          left: rect.right + 6,
          top: rect.top + rect.height / 2,
        });
        return;
      }
      if (placement === "up") {
        setPos({
          left: rect.left + rect.width / 2,
          top: rect.top - 6,
        });
        return;
      }
      setPos({
        left: rect.left + rect.width / 2,
        top: rect.bottom + 6,
      });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;

    const ac = new AbortController();
    const { signal } = ac;

    document.addEventListener(
      "pointerdown",
      (event) => {
        const target = event.target;
        if (!(target instanceof Node)) return;
        if (rootRef.current?.contains(target)) return;
        if (menuRef.current?.contains(target)) return;
        setOpen(false);
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

  const listClass =
    placement === "right"
      ? "lang-menu__list lang-menu__list--portal lang-menu__list--right"
      : placement === "up"
        ? "lang-menu__list lang-menu__list--portal lang-menu__list--up"
        : "lang-menu__list lang-menu__list--portal";

  const menu =
    open && mounted && pos
      ? createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            className={listClass}
            role="listbox"
            aria-label="Language"
            style={{ left: pos.left, top: pos.top }}
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
          </ul>,
          document.body
        )
      : null;

  return (
    <div className="lang-menu" ref={rootRef}>
      <button
        ref={buttonRef}
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
      {menu}
    </div>
  );
}
