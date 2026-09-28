"use client";

import { useEffect, useRef, useState } from "react";

export function RecoveryCodesDialog({
  codes,
  onConfirm,
}: {
  codes: string[];
  onConfirm: () => void;
}) {
  const confirmButton = useRef<HTMLButtonElement>(null);
  const content = codes.join("\n");
  const [copyStatus, setCopyStatus] = useState<string>();

  useEffect(() => {
    confirmButton.current?.focus();
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
    <div role="dialog" aria-modal="true" aria-labelledby="recovery-codes-title">
      <h2 id="recovery-codes-title">Save your recovery codes</h2>
      <p>These single-use codes will not be shown again.</p>
      <pre>{content}</pre>
      <button onClick={() => void copy()}>Copy codes</button>
      <button onClick={download}>Download codes</button>
      <button ref={confirmButton} onClick={onConfirm}>
        I saved my codes
      </button>
      {copyStatus && <p role="status">{copyStatus}</p>}
    </div>
  );
}
