"use client";

import { useEffect, useRef } from "react";

export function RecoveryCodesDialog({
  codes,
  onConfirm,
}: {
  codes: string[];
  onConfirm: () => void;
}) {
  const confirmButton = useRef<HTMLButtonElement>(null);
  const content = codes.join("\n");

  useEffect(() => {
    confirmButton.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onConfirm();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onConfirm]);

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
    <div role="dialog" aria-modal="true" aria-labelledby="recovery-codes-title">
      <h2 id="recovery-codes-title">Save your recovery codes</h2>
      <p>These single-use codes will not be shown again.</p>
      <pre>{content}</pre>
      <button onClick={() => void navigator.clipboard.writeText(content)}>
        Copy codes
      </button>
      <button onClick={download}>Download codes</button>
      <button ref={confirmButton} onClick={onConfirm}>
        I saved my codes
      </button>
    </div>
  );
}
