"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { ApiError, jsonRequest } from "@/lib/api/client";

type DeliveryMethod = "OTP" | "MAGIC_LINK";

export default function RecoveryEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("OTP");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/request", { email, deliveryMethod });
      setRequested(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery instructions could not be requested.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/verify", { email, code });
      router.replace("/restore-access");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery could not be verified.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <p className="eyebrow">RECOVERY EMAIL</p>
      <h1>Verify your recovery email</h1>
      {!requested ? (
        <form onSubmit={request}>
          <p>
            If an eligible account exists, we will send the selected recovery
            instructions.
          </p>
          <label htmlFor="email">Recovery email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="delivery-method">Delivery method</label>
          <select
            id="delivery-method"
            value={deliveryMethod}
            onChange={(event) =>
              setDeliveryMethod(event.target.value as DeliveryMethod)
            }
          >
            <option value="OTP">Verification code</option>
            <option value="MAGIC_LINK">Magic Link</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send recovery instructions"}
          </button>
        </form>
      ) : deliveryMethod === "OTP" ? (
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
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify code"}
          </button>
        </form>
      ) : (
        <p>
          If an eligible account exists, a secure link was sent to {email}. It
          expires in five minutes.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
