import type { HTMLAttributes, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/cn";

type Tone = "error" | "success" | "info";

const toneStyles: Record<Tone, string> = {
  error: "border-danger-200 bg-danger-50 text-danger-800",
  success: "border-brand-200 bg-brand-50 text-brand-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

const icons = { error: AlertCircle, success: CheckCircle2, info: Info };

export function Alert({
  children,
  className,
  tone = "info",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  tone?: Tone;
}) {
  const Icon = icons[tone];
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-3 text-sm leading-6",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
