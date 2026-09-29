"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { FocusError } from "@/components/focus-error";
import { Button } from "@/components/ui/button";
import {
  ApiError,
  apiRequest,
  apiUrl,
  protectedJsonRequest,
} from "@/lib/api/client";

type OptionsResponse = { data: { challengeId: string; options: object } };
type MethodsResponse = { data: { passkey: boolean; google: boolean } };

export function StepUpDialog({
  onVerified,
  onCancel,
  onGoogleRedirect,
}: {
  onVerified: () => Promise<void>;
  onCancel: () => void;
  onGoogleRedirect?: () => void;
}) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState<MethodsResponse["data"]>();
  const dialog = useRef<HTMLDivElement>(null);
  const verifyButton = useRef<HTMLButtonElement>(null);
  const googleButton = useRef<HTMLButtonElement>(null);
  const cancelFromKeyboard = useEffectEvent(() => {
    if (!loading) onCancel();
  });

  useEffect(() => {
    void apiRequest<MethodsResponse>("/api/step-up/passkey/methods")
      .then((result) => setMethods(result.data))
      .catch((cause) =>
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Verification methods could not be loaded.",
        ),
      );
  }, []);
  useEffect(() => {
    if (!methods) return;
    (methods.passkey ? verifyButton.current : googleButton.current)?.focus();
  }, [methods]);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
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
      if (!controls.includes(document.activeElement as HTMLElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
        if (!first) dialog.current.focus();
        return;
      }
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
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="step-up-title"
        aria-describedby="step-up-description"
        className="fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 overflow-auto rounded-2xl border border-line bg-white p-5 shadow-panel sm:p-6"
      >
        <div className="grid gap-2">
          <p className="text-xs font-bold tracking-[0.14em] text-brand-700">
            SECURITY CHECK
          </p>
          <h2 id="step-up-title" className="text-xl font-bold text-ink">
            Verify it is you
          </h2>
          <p id="step-up-description" className="text-sm leading-6 text-muted">
            {methods?.passkey && methods.google
              ? "Verify with a Passkey or your linked Google account to continue."
              : methods?.passkey
                ? "Verify with one of your Passkeys to continue."
                : methods?.google
                  ? "Verify with your linked Google account to continue."
                  : "Loading your verification methods."}
          </p>
        </div>
        <div className="grid gap-2">
          {methods?.passkey && (
            <Button ref={verifyButton} onClick={verify} loading={loading}>
              {loading ? "Verifying..." : "Verify with Passkey"}
            </Button>
          )}
          {methods?.google && (
            <Button
              ref={googleButton}
              variant="secondary"
              onClick={() => {
                onGoogleRedirect?.();
                const source = window.location.pathname.includes("/recovery")
                  ? "recovery"
                  : "sign-in";
                window.location.assign(
                  apiUrl(`/api/step-up/google/start?source=${source}`),
                );
              }}
              disabled={loading}
            >
              Verify with Google
            </Button>
          )}
          <Button variant="danger" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
        <FocusError message={error} />
      </div>
    </>
  );
}
