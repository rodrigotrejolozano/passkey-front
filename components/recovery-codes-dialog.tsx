"use client";

import { useEffect, useRef, useState } from "react";

export function RecoveryCodesDialog({
  codes,
  onConfirm,
}: {
  codes: string[];
  onConfirm: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const copyButton = useRef<HTMLButtonElement>(null);
  const content = codes.join("\n");
  const [copyStatus, setCopyStatus] = useState<string>();

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    copyButton.current?.focus();
    function containFocus(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;
      const controls = Array.from(
        dialog.current.querySelectorAll<HTMLElement>("button, [href], input"),
      ).filter((element) => !element.hasAttribute("disabled"));
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
    document.addEventListener("keydown", containFocus);
    return () => {
      document.removeEventListener("keydown", containFocus);
      previousFocus?.focus();
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus("Codes copied.");
    } catch {
      setCopyStatus(
        "Codes could not be copied. Download or save them manually.",
      );
    }
  }

  function download() {
    const url = URL.createObjectURL(
      new Blob([`${content}\n`], { type: "text/plain" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "passkey-recovery-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

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
        aria-labelledby="recovery-codes-title"
        aria-describedby="recovery-codes-description"
        className="fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 overflow-auto rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6"
      >
        <div className="grid gap-1">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-700">
            ACCOUNT RECOVERY
          </p>
          <h2 id="recovery-codes-title" className="text-xl font-bold text-ink">
            Save your recovery codes
          </h2>
          <p
            id="recovery-codes-description"
            className="text-sm leading-6 text-muted"
          >
            These single-use codes will not be shown again.
          </p>
        </div>
        <pre className="overflow-auto rounded-xl bg-canvas p-4 text-sm leading-6 text-ink">
          {content}
        </pre>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            ref={copyButton}
            onClick={() => void copy()}
            className="min-h-11 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Copy codes
          </button>
          <button
            onClick={download}
            className="min-h-11 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-canvas"
          >
            Download codes
          </button>
          <button
            onClick={onConfirm}
            className="min-h-11 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 sm:col-span-2"
          >
            I saved my codes
          </button>
        </div>
        {copyStatus && (
          <p role="status" className="text-sm leading-6 text-muted">
            {copyStatus}
          </p>
        )}
      </div>
    </>
  );
}
