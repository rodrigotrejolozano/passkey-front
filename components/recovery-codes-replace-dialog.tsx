"use client";

import { useEffect, useRef } from "react";

export function RecoveryCodesReplaceDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    cancelButton.current?.focus();
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;
      const controls = Array.from(
        dialog.current.querySelectorAll<HTMLButtonElement>("button"),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
      previousFocus?.focus();
    };
  }, [onCancel]);

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="replace-codes-title"
      aria-describedby="replace-codes-description"
    >
      <h2 id="replace-codes-title">Replace recovery codes?</h2>
      <p id="replace-codes-description">
        Generating new recovery codes will immediately invalidate every unused
        recovery code you saved before.
      </p>
      <button ref={cancelButton} onClick={onCancel}>
        Keep current codes
      </button>
      <button onClick={onConfirm}>Generate new codes</button>
    </div>
  );
}
