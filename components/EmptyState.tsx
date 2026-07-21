"use client";

import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  role?: string;
};

export function EmptyState({ icon, title, hint, action, role }: Props) {
  return (
    <div className="empty empty--state" role={role}>
      {icon ? <div className="empty__icon">{icon}</div> : null}
      <p className="empty__title">{title}</p>
      {hint ? <p className="hint empty__hint">{hint}</p> : null}
      {action}
    </div>
  );
}
