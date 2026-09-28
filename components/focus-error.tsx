"use client";

import { useEffect, useRef } from "react";

export function FocusError({ message }: { message?: string | null }) {
  const element = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (message) element.current?.focus();
  }, [message]);

  if (!message) return null;
  return (
    <p ref={element} role="alert" tabIndex={-1}>
      {message}
    </p>
  );
}
