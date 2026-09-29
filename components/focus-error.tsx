"use client";

import { useEffect, useRef } from "react";

export function FocusError({ message }: { message?: string | null }) {
  const element = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (message) element.current?.focus();
  }, [message]);

  if (!message) return null;
  return (
    <p
      ref={element}
      role="alert"
      tabIndex={-1}
      className="rounded-xl border border-danger-200 bg-danger-50 px-3 py-3 text-sm leading-6 text-danger-800"
    >
      {message}
    </p>
  );
}
