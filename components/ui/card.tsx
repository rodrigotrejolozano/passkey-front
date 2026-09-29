import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-xl border border-line bg-white p-5 shadow-sm sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
