"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { ApiError, jsonRequest } from "@/lib/api/client";

export default function RecoveryPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [requested, setRequested] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string>();
  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    await jsonRequest("/api/recovery/request", { email });
    setRequested(true);
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/verify", { email, code });
      setVerified(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery could not be verified.",
      );
    }
  }
  return (
    <main>
      <p className="eyebrow">ACCOUNT RECOVERY</p>
      <h1>Recover access</h1>
      {!requested ? (
        <form onSubmit={request}>
          <p>
            Enter your verified recovery email. We will send instructions if an
            account is eligible.
          </p>
          <label htmlFor="email">Recovery email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit">Send recovery code</button>
        </form>
      ) : !verified ? (
        <form onSubmit={verify}>
          <p>If an eligible account exists, a code was sent to {email}.</p>
          <label htmlFor="code">Recovery code</label>
          <input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          <button type="submit">Verify code</button>
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
      <Link href="/recovery/code">Use a recovery code</Link>
      <Link href="/sign-in">Back to sign in</Link>
    </main>
  );
}
