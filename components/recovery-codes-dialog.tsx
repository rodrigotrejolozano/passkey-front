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
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-codes-title"
      aria-describedby="recovery-codes-description"
    >
      <h2 id="recovery-codes-title">Save your recovery codes</h2>
      <p id="recovery-codes-description">
        These single-use codes will not be shown again.
      </p>
      <pre>{content}</pre>
      <button ref={copyButton} onClick={() => void copy()}>
        Copy codes
      </button>
      <button onClick={download}>Download codes</button>
      <button onClick={onConfirm}>I saved my codes</button>
      {copyStatus && <p role="status">{copyStatus}</p>}
    </div>
  );
}
