import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    label: ReactNode;
    hint?: ReactNode;
    error?: ReactNode;
  }
>(function Field({ id, label, hint, error, className, ...props }, ref) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={cn(
          "min-h-11 rounded-xl border bg-white px-3 text-ink shadow-sm outline-none transition placeholder:text-muted focus:border-brand-600 focus:ring-3 focus:ring-brand-100",
          error ? "border-danger-500" : "border-line",
          className,
        )}
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error) || undefined}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm leading-6 text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm leading-6 text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
});
