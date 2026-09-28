"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, apiUrl, jsonRequest } from "@/lib/api/client";

type RegistrationOptions = { data: { challengeId: string; options: object } };

export default function RestoreAccessPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function restore() {
    setLoading(true);
    setError(undefined);
    try {
      const options = await jsonRequest<RegistrationOptions>(
        "/api/recovery/restore/passkey/options",
        {},
      );
      const response = await startRegistration({
        optionsJSON: options.data.options as never,
      });
      await jsonRequest("/api/recovery/restore/passkey/verify", {
        challengeId: options.data.challengeId,
        response,
      });
      router.replace("/home");
    } catch (cause) {
      const browserError =
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Passkey creation was cancelled or timed out."
          : cause instanceof DOMException && cause.name === "InvalidStateError"
            ? "This device already has a Passkey for this account."
            : "Passkey restoration could not be completed.";
      setError(cause instanceof ApiError ? cause.message : browserError);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main>
      <p className="eyebrow">RESTORE ACCESS</p>
      <h1>Create a new Passkey</h1>
      <p>
        Your recovery verification is valid for a limited time. Create a new
        Passkey to regain normal access.
      </p>
      <button onClick={restore} disabled={loading}>
        {loading ? "Creating Passkey..." : "Create Passkey"}
      </button>
      <button
        onClick={() =>
          window.location.assign(apiUrl("/api/recovery/google/start"))
        }
        disabled={loading}
      >
        Restore with Google
      </button>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
