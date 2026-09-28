"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { ApiError, jsonRequest } from "@/lib/api/client";

export default function RecoveryCodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [verified, setVerified] = useState(false);
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/code", { code });
      setVerified(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery code could not be verified.",
      );
    }
  }
  return (
    <main>
      <p className="eyebrow">ACCOUNT RECOVERY</p>
      <h1>Use a recovery code</h1>
      {!verified ? (
        <form onSubmit={verify}>
          <label htmlFor="code">Recovery code</label>
          <input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="one-time-code"
            required
          />
          <button type="submit">Verify recovery code</button>
        </form>
      ) : (
        <p>
          Recovery verified.{" "}
          <Link href="/restore-access">
            Create a new Passkey to restore access
          </Link>
          .
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      <Link href="/recovery">Use recovery email instead</Link>
    </main>
  );
}
