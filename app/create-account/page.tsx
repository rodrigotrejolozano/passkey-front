"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, jsonRequest } from "@/lib/api/client";

type RegistrationOptions = { data: { challengeId: string; options: object } };

export default function CreateAccountPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!name.trim()) return setError("Enter your name to continue.");
    setLoading(true);
    setError(null);
    try {
      const options = await jsonRequest<RegistrationOptions>(
        "/api/auth/passkey/registration/options",
        { displayName: name.trim() },
      );
      const response = await startRegistration({
        optionsJSON: options.data.options as never,
      });
      await jsonRequest("/api/auth/passkey/registration/verify", {
        challengeId: options.data.challengeId,
        response,
      });
      router.push("/home");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Passkey registration was cancelled or could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <p className="eyebrow">CREATE ACCOUNT</p>
      <h1>Choose how you want to sign in.</h1>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="name"
      />
      <button onClick={register} disabled={loading}>
        {loading ? "Creating passkey..." : "Continue with Passkey"}
      </button>
      <button disabled>Continue with Google (coming next)</button>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
