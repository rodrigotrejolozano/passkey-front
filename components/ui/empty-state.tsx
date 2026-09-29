import type { ReactNode } from "react";

import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center gap-3 rounded-xl border border-dashed border-line bg-canvas px-5 py-9 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-brand-100 text-brand-800">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <div className="grid gap-1">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
