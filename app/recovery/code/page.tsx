"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { FocusError } from "@/components/focus-error";
import { ApiError, jsonRequest } from "@/lib/api/client";

export default function RecoveryCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/code", { code });
      router.replace("/restore-access");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery code could not be verified.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main>
      <p className="eyebrow">ACCOUNT RECOVERY</p>
      <h1>Use a recovery code</h1>
      <form onSubmit={verify}>
        <label htmlFor="code">Recovery code</label>
        <input
          id="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="one-time-code"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify recovery code"}
        </button>
      </form>
      <FocusError message={error} />
      <Link href="/recovery/email">Use recovery email instead</Link>
    </main>
  );
}
