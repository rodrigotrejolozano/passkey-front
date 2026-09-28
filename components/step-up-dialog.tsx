"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useState } from "react";

import { ApiError, protectedJsonRequest } from "@/lib/api/client";

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
    <div role="dialog" aria-modal="true">
      <h2>Verify it is you</h2>
      <p>Use one of your Passkeys to continue with this sensitive action.</p>
      <button onClick={verify} disabled={loading}>
        {loading ? "Verifying..." : "Verify with Passkey"}
      </button>
      <button onClick={onCancel} disabled={loading}>
        Cancel
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
