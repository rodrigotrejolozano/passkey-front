"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiError, jsonRequest } from "@/lib/api/client";

type AuthenticationOptions = { data: { challengeId: string; options: object } };

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      const options = await jsonRequest<AuthenticationOptions>(
        "/api/auth/passkey/authentication/options",
        {},
      );
      const response = await startAuthentication({
        optionsJSON: options.data.options as never,
      });
      await jsonRequest("/api/auth/passkey/authentication/verify", {
        challengeId: options.data.challengeId,
        response,
      });
      router.push("/home");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Passkey sign-in was cancelled or could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <p className="eyebrow">WELCOME BACK</p>
      <h1>Sign in without a password.</h1>
      <button onClick={signIn} disabled={loading}>
        {loading ? "Signing in..." : "Sign in with Passkey"}
      </button>
      <button
        onClick={() =>
          (window.location.href = `${process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"}/api/auth/google/start`)
        }
        disabled={loading}
      >
        Continue with Google
      </button>
      <Link href="/recovery">Can&apos;t access your account?</Link>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
