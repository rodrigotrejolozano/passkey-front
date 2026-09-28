"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FocusError } from "@/components/focus-error";
import { ApiError, apiUrl, protectedJsonRequest } from "@/lib/api/client";

type RegistrationOptions = { data: { challengeId: string; options: object } };

export default function RestoreAccessPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function restore() {
    setLoading(true);
    setError(undefined);
    try {
      const options = await protectedJsonRequest<RegistrationOptions>(
        "/api/recovery/restore/passkey/options",
        {},
        "recovery",
      );
      const response = await startRegistration({
        optionsJSON: options.data.options as never,
      });
      await protectedJsonRequest(
        "/api/recovery/restore/passkey/verify",
        { challengeId: options.data.challengeId, response },
        "recovery",
      );
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
      <FocusError message={error} />
    </main>
  );
}
