"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { AuthNavigation } from "@/components/auth-navigation";
import { RecoveryCodesDialog } from "@/components/recovery-codes-dialog";
import { StepUpDialog } from "@/components/step-up-dialog";
import {
  apiRequest,
  protectedJsonRequest,
  protectedRequest,
} from "@/lib/api/client";

type RecoveryEmailResponse = {
  data: { recoveryEmail: { email: string; verifiedAt: string } | null };
};
type VerificationResponse = { data: { challengeId: string } };
type RecoveryCodesResponse = { data: { codes: string[] } };
type DeliveryMethod = "OTP" | "MAGIC_LINK";

export default function RecoverySettingsPage() {
  const [configured, setConfigured] =
    useState<RecoveryEmailResponse["data"]["recoveryEmail"]>(null);
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string>();
  const [code, setCode] = useState("");
  const [action, setAction] = useState<() => Promise<void>>();
  const [editing, setEditing] = useState(false);
  const [codes, setCodes] = useState<string[]>();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("OTP");
  const [linkSent, setLinkSent] = useState(false);
  const load = () =>
    apiRequest<RecoveryEmailResponse>("/api/security/recovery-email").then(
      (result) => setConfigured(result.data.recoveryEmail),
    );
  useEffect(() => {
    void load();
  }, []);
  async function requestVerification() {
    const result = await protectedJsonRequest<VerificationResponse>(
      "/api/security/recovery-email/verification",
      { email, deliveryMethod },
    );
    if (deliveryMethod === "OTP") setChallengeId(result.data.challengeId);
    else setLinkSent(true);
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId) return;
    await protectedJsonRequest(
      "/api/security/recovery-email/verification/confirm",
      {
        challengeId,
        code,
      },
    );
    setChallengeId(undefined);
    setCode("");
    setEditing(false);
    await load();
  }
  async function remove() {
    await protectedRequest("/api/security/recovery-email", {
      method: "DELETE",
    });
    await load();
  }
  async function generateCodes() {
    const result = await protectedJsonRequest<RecoveryCodesResponse>(
      "/api/security/recovery-email/codes",
      {},
    );
    setCodes(result.data.codes);
  }
  return (
    <main>
      <AuthNavigation />
      <p className="eyebrow">ACCOUNT RECOVERY</p>
      <h1>Protect your account</h1>
      <p>
        Add a verified recovery email and save recovery codes before you need
        them.
      </p>
      <Link href="/home">Continue to Home</Link>
      {configured ? (
        <>
          <p>{configured.email} is verified.</p>
          <button onClick={() => setAction(() => remove)}>
            Remove recovery email
          </button>
          <button onClick={() => setEditing(true)}>
            Change recovery email
          </button>
        </>
      ) : (
        <p>Add an email you can use if all sign-in methods are unavailable.</p>
      )}
      {(!configured || editing) && !challengeId && (
        <>
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
          <button onClick={() => setAction(() => requestVerification)}>
            Send verification instructions
          </button>
          {linkSent && (
            <p>
              Check your inbox. The verification link expires in five minutes.
            </p>
          )}
        </>
      )}
      {challengeId && (
        <form onSubmit={confirm}>
          <label htmlFor="code">Verification code</label>
          <input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
          />
          <button type="submit">Verify recovery email</button>
        </form>
      )}
      <h2>Recovery codes</h2>
      <p>Generate single-use codes as a backup if email is unavailable.</p>
      <button onClick={() => setAction(() => generateCodes)}>
        Generate recovery codes
      </button>
      {codes && (
        <RecoveryCodesDialog
          codes={codes}
          onConfirm={() => setCodes(undefined)}
        />
      )}
      {action && (
        <StepUpDialog
          onCancel={() => setAction(undefined)}
          onVerified={async () => {
            await action();
            setAction(undefined);
          }}
        />
      )}
    </main>
  );
}
