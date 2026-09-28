"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { FocusError } from "@/components/focus-error";
import { ApiError, apiUrl, protectedJsonRequest } from "@/lib/api/client";

type OptionsResponse = { data: { challengeId: string; options: object } };

export function StepUpDialog({
  onVerified,
  onCancel,
}: {
  onVerified: () => Promise<void>;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const verifyButton = useRef<HTMLButtonElement>(null);
  const cancelFromKeyboard = useEffectEvent(() => {
    if (!loading) onCancel();
  });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    verifyButton.current?.focus();
    function handleKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        cancelFromKeyboard();
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;
      const controls = Array.from(
        dialog.current.querySelectorAll<HTMLElement>("button:not([disabled])"),
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
  }, []);
  async function verify() {
    setLoading(true);
    setError(undefined);
    try {
      const options = await protectedJsonRequest<OptionsResponse>(
        "/api/step-up/passkey/options",
        {},
      );
      const response = await startAuthentication({
        optionsJSON: options.data.options as never,
      });
      await protectedJsonRequest("/api/step-up/passkey/verify", {
        challengeId: options.data.challengeId,
        response,
      });
      await onVerified();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Passkey verification was cancelled or could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-up-title"
      aria-describedby="step-up-description"
    >
      <h2 id="step-up-title">Verify it is you</h2>
      <p id="step-up-description">
        Verify with a Passkey or your linked Google account to continue.
      </p>
      <button ref={verifyButton} onClick={verify} disabled={loading}>
        {loading ? "Verifying..." : "Verify with Passkey"}
      </button>
      <button
        onClick={() =>
          window.location.assign(apiUrl("/api/step-up/google/start"))
        }
        disabled={loading}
      >
        Verify with Google
      </button>
      <button onClick={onCancel} disabled={loading}>
        Cancel
      </button>
      <FocusError message={error} />
    </div>
  );
}
