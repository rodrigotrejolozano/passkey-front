"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

export function RecoveryCodesReplaceDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("dialogs");
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
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="replace-codes-title"
        aria-describedby="replace-codes-description"
        className="fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 overflow-auto rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6"
      >
        <div className="grid gap-2">
          <p className="text-xs font-bold tracking-[0.14em] text-danger-700">
            {t("warning")}
          </p>
          <h2 id="replace-codes-title" className="text-xl font-bold text-ink">
            {t("replaceTitle")}
          </h2>
          <p
            id="replace-codes-description"
            className="text-sm leading-6 text-muted"
          >
            {t("replaceDescription")}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            ref={cancelButton}
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            {t("keepCodes")}
          </button>
          <button
            onClick={onConfirm}
            className="min-h-11 rounded-xl bg-danger-600 px-4 text-sm font-semibold text-white hover:bg-danger-700"
          >
            {t("generateCodes")}
          </button>
        </div>
      </div>
    </>
  );
}
