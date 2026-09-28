"use client";

import { FormEvent, useEffect, useState } from "react";

import { AuthNavigation } from "@/components/auth-navigation";
import { StepUpDialog } from "@/components/step-up-dialog";
import { apiRequest, jsonRequest } from "@/lib/api/client";

type RecoveryEmailResponse = {
  data: { recoveryEmail: { email: string; verifiedAt: string } | null };
};
type VerificationResponse = { data: { challengeId: string } };

export default function RecoverySettingsPage() {
  const [configured, setConfigured] =
    useState<RecoveryEmailResponse["data"]["recoveryEmail"]>(null);
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string>();
  const [code, setCode] = useState("");
  const [action, setAction] = useState<() => Promise<void>>();
  const load = () =>
    apiRequest<RecoveryEmailResponse>("/api/security/recovery-email").then(
      (result) => setConfigured(result.data.recoveryEmail),
    );
  useEffect(() => {
    void load();
  }, []);
  async function requestVerification() {
    const result = await jsonRequest<VerificationResponse>(
      "/api/security/recovery-email/verification",
      { email },
    );
    setChallengeId(result.data.challengeId);
  }
  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challengeId) return;
    await jsonRequest("/api/security/recovery-email/verification/confirm", {
      challengeId,
      code,
    });
    setChallengeId(undefined);
    setCode("");
    await load();
  }
  async function remove() {
    await apiRequest("/api/security/recovery-email", { method: "DELETE" });
    await load();
  }
  return (
    <main>
      <AuthNavigation />
      <p className="eyebrow">ACCOUNT RECOVERY</p>
      <h1>Recovery email</h1>
      {configured ? (
        <>
          <p>{configured.email} is verified.</p>
          <button onClick={() => setAction(() => remove)}>
            Remove recovery email
          </button>
        </>
      ) : (
        <p>Add an email you can use if all sign-in methods are unavailable.</p>
      )}
      {!challengeId && (
        <>
          <label htmlFor="email">Recovery email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button onClick={() => setAction(() => requestVerification)}>
            Send verification code
          </button>
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
