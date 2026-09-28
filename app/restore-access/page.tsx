"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, jsonRequest } from "@/lib/api/client";

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
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Passkey restoration could not be completed.",
      );
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
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
