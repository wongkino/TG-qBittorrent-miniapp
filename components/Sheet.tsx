"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

const DISMISS_PX = 72;

export function Sheet({ title, children, onClose }: Props) {
  const { t } = useI18n();
  const titleId = useId();
  const startY = useRef(0);
  const dragging = useRef(false);
  const [offset, setOffset] = useState(0);
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(id);
      document.body.style.overflow = prev;
    };
  }, []);

  const close = useCallback(() => {
    setEntered(false);
    window.setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    dragging.current = true;
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onHandlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dy = Math.max(0, event.clientY - startY.current);
    setOffset(dy);
  }

  function onHandlePointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (offset >= DISMISS_PX) {
      close();
      return;
    }
    setOffset(0);
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={`sheet${entered ? " sheet--open" : ""}`}
      role="presentation"
    >
      <button
        type="button"
        className="sheet__backdrop"
        aria-label={t("sheet.close")}
        onClick={close}
      />
      <div
        className="sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={
          offset
            ? { transform: `translateY(${offset}px)`, transition: "none" }
            : undefined
        }
      >
        <div
          className="sheet__handle"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <span className="sheet__grab" />
        </div>
        <div className="sheet__header">
          <h2 id={titleId} className="sheet__title">
            {title}
          </h2>
          <button type="button" className="btn btn--sm" onClick={close}>
            {t("sheet.done")}
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
