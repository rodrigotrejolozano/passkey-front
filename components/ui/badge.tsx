import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold tracking-wide text-brand-800",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
