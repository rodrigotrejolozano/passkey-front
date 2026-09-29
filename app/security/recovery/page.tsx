"use client";

import Link from "next/link";
import { FormEvent, useEffect, useEffectEvent, useState } from "react";

import { AuthNavigation } from "@/components/auth-navigation";
import { FocusError } from "@/components/focus-error";
import { RecoveryCodesDialog } from "@/components/recovery-codes-dialog";
import { RecoveryCodesReplaceDialog } from "@/components/recovery-codes-replace-dialog";
import { StepUpDialog } from "@/components/step-up-dialog";
import {
  ApiError,
  apiRequest,
  protectedJsonRequest,
  protectedRequest,
} from "@/lib/api/client";

type RecoveryEmailResponse = {
  data: { recoveryEmail: { email: string; verifiedAt: string } | null };
};
type VerificationResponse = { data: { challengeId: string } };
type RecoveryCodesResponse = { data: { codes: string[] } };
type RecoveryCodesStatusResponse = { data: { configured: boolean } };
type DeliveryMethod = "OTP" | "MAGIC_LINK";
type PendingAction =
  | { type: "remove" }
  | { type: "verify"; email: string; deliveryMethod: DeliveryMethod }
  | { type: "codes" };
const RESUME_KEY = "passkey.recovery-step-up";

export default function RecoverySettingsPage() {
  const [configured, setConfigured] =
    useState<RecoveryEmailResponse["data"]["recoveryEmail"]>(null);
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string>();
  const [code, setCode] = useState("");
  const [action, setAction] = useState<PendingAction>();
  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState(false);
  const [codes, setCodes] = useState<string[]>();
  const [recoveryCodesConfigured, setRecoveryCodesConfigured] = useState(false);
  const [confirmCodeReplacement, setConfirmCodeReplacement] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("OTP");
  const [linkSent, setLinkSent] = useState(false);
  const load = () =>
    Promise.all([
      apiRequest<RecoveryEmailResponse>("/api/security/recovery-email"),
      apiRequest<RecoveryCodesStatusResponse>(
        "/api/security/recovery-email/codes",
      ),
    ]).then(([emailResult, codesResult]) => {
      setConfigured(emailResult.data.recoveryEmail);
      setRecoveryCodesConfigured(codesResult.data.configured);
    });
  function showError(cause: unknown) {
    setError(
      cause instanceof ApiError
        ? cause.message
        : "The security action could not be completed.",
    );
  }
  async function requestVerification(
    targetEmail = email,
    method = deliveryMethod,
  ) {
    setError(undefined);
    const result = await protectedJsonRequest<VerificationResponse>(
      "/api/security/recovery-email/verification",
      { email: targetEmail, deliveryMethod: method },
    );
    setEmail(targetEmail);
    setDeliveryMethod(method);
    if (method === "OTP") setChallengeId(result.data.challengeId);
    else setLinkSent(true);
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId) return;
    setError(undefined);
    try {
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
    } catch (cause) {
      showError(cause);
    }
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
    setRecoveryCodesConfigured(true);
  }
  async function runAction(pending: PendingAction) {
    if (pending.type === "remove") return remove();
    if (pending.type === "codes") return generateCodes();
    if (pending.type === "verify")
      return requestVerification(pending.email, pending.deliveryMethod);
    throw new Error("Unknown recovery action");
  }
  const resumeAfterGoogle = useEffectEvent(async (saved: string) => {
    try {
      await load();
      await runAction(JSON.parse(saved) as PendingAction);
      window.history.replaceState(null, "", "/security/recovery");
    } catch (cause) {
      showError(cause);
    }
  });
  useEffect(() => {
    const stepUp = new URLSearchParams(window.location.search).get("stepUp");
    if (stepUp !== "complete") {
      if (stepUp === "failed") window.sessionStorage.removeItem(RESUME_KEY);
      void load();
      return;
    }
    const saved = window.sessionStorage.getItem(RESUME_KEY);
    window.sessionStorage.removeItem(RESUME_KEY);
    if (saved) queueMicrotask(() => void resumeAfterGoogle(saved));
    else void load();
  }, []);
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
          <button onClick={() => setAction({ type: "remove" })}>
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
          <button
            onClick={() => setAction({ type: "verify", email, deliveryMethod })}
          >
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
      <p>
        {recoveryCodesConfigured
          ? "Recovery codes are already configured. Generate new codes only if you no longer have the previous set."
          : "Generate single-use codes as a backup if email is unavailable."}
      </p>
      <button
        onClick={() =>
          recoveryCodesConfigured
            ? setConfirmCodeReplacement(true)
            : setAction({ type: "codes" })
        }
      >
        {recoveryCodesConfigured
          ? "Generate new recovery codes"
          : "Generate recovery codes"}
      </button>
      {confirmCodeReplacement && (
        <RecoveryCodesReplaceDialog
          onCancel={() => setConfirmCodeReplacement(false)}
          onConfirm={() => {
            setConfirmCodeReplacement(false);
            setAction({ type: "codes" });
          }}
        />
      )}
      {codes && (
        <RecoveryCodesDialog
          codes={codes}
          onConfirm={() => setCodes(undefined)}
        />
      )}
      {action && (
        <StepUpDialog
          onCancel={() => setAction(undefined)}
          onGoogleRedirect={() =>
            window.sessionStorage.setItem(RESUME_KEY, JSON.stringify(action))
          }
          onVerified={async () => {
            await runAction(action);
            setAction(undefined);
          }}
        />
      )}
      <FocusError message={error} />
    </main>
  );
}
