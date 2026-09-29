"use client";

import Link from "next/link";
import { FormEvent, useEffect, useEffectEvent, useState } from "react";

import { SettingsShell } from "@/components/layout/settings-shell";
import { FocusError } from "@/components/focus-error";
import { RecoveryCodesDialog } from "@/components/recovery-codes-dialog";
import { RecoveryCodesReplaceDialog } from "@/components/recovery-codes-replace-dialog";
import { StepUpDialog } from "@/components/step-up-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  function showError(cause: unknown) {
    setError(
      cause instanceof ApiError
        ? cause.message
        : "The security action could not be completed.",
    );
  }

  async function load() {
    setLoading(true);
    try {
      const [emailResult, codesResult] = await Promise.all([
        apiRequest<RecoveryEmailResponse>("/api/security/recovery-email"),
        apiRequest<RecoveryCodesStatusResponse>(
          "/api/security/recovery-email/codes",
        ),
      ]);
      setConfigured(emailResult.data.recoveryEmail);
      setRecoveryCodesConfigured(codesResult.data.configured);
      setLoaded(true);
    } catch (cause) {
      showError(cause);
      throw cause;
    } finally {
      setLoading(false);
    }
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
    setError(undefined);
    try {
      await protectedRequest("/api/security/recovery-email", {
        method: "DELETE",
      });
      await load();
    } catch (cause) {
      showError(cause);
      throw cause;
    }
  }

  async function generateCodes() {
    setError(undefined);
    try {
      const result = await protectedJsonRequest<RecoveryCodesResponse>(
        "/api/security/recovery-email/codes",
        {},
      );
      setCodes(result.data.codes);
      setRecoveryCodesConfigured(true);
    } catch (cause) {
      showError(cause);
      throw cause;
    }
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
  const loadAfterMount = useEffectEvent(
    () => void load().catch(() => undefined),
  );

  useEffect(() => {
    const stepUp = new URLSearchParams(window.location.search).get("stepUp");
    if (stepUp !== "complete") {
      if (stepUp === "failed") window.sessionStorage.removeItem(RESUME_KEY);
      queueMicrotask(loadAfterMount);
      return;
    }
    const saved = window.sessionStorage.getItem(RESUME_KEY);
    window.sessionStorage.removeItem(RESUME_KEY);
    if (saved) queueMicrotask(() => void resumeAfterGoogle(saved));
    else queueMicrotask(loadAfterMount);
  }, []);

  return (
    <SettingsShell>
      <div className="grid w-full gap-6">
        <section className="grid gap-3">
          <p className="eyebrow">ACCOUNT RECOVERY</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Protect your account
          </h1>
          <p className="leading-7 text-muted">
            Add a verified recovery email and save recovery codes before you
            need them.
          </p>
          <Link
            href="/home"
            className="w-fit text-sm font-semibold text-brand-800 hover:text-brand-900"
          >
            Continue to Home
          </Link>
        </section>

        <FocusError message={error} />

        <Card className="grid gap-5">
          <div className="grid gap-1">
            <h2 className="text-lg font-bold text-ink">Recovery email</h2>
            <p className="text-sm leading-6 text-muted">
              Keep an email ready in case all sign-in methods are unavailable.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-11 w-52" />
            </div>
          ) : loaded ? (
            <>
              {configured ? (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line px-4 py-4">
                  <p className="font-semibold text-ink">
                    {configured.email} is verified.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      Change recovery email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAction({ type: "remove" })}
                    >
                      Remove recovery email
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Add an email you can use if all sign-in methods are
                  unavailable.
                </p>
              )}

              {(!configured || editing) && !challengeId && (
                <div className="grid gap-5 border-t border-line pt-5">
                  <Field
                    id="email"
                    type="email"
                    label="Recovery email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  <div className="grid gap-2">
                    <label
                      htmlFor="delivery-method"
                      className="text-sm font-semibold text-ink"
                    >
                      Delivery method
                    </label>
                    <select
                      id="delivery-method"
                      value={deliveryMethod}
                      onChange={(event) =>
                        setDeliveryMethod(event.target.value as DeliveryMethod)
                      }
                      className="min-h-11 rounded-xl border border-line bg-white px-3 text-ink shadow-sm outline-none focus:border-brand-600 focus:ring-3 focus:ring-brand-100"
                    >
                      <option value="OTP">Verification code</option>
                      <option value="MAGIC_LINK">Magic Link</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() =>
                        setAction({ type: "verify", email, deliveryMethod })
                      }
                    >
                      Send verification instructions
                    </Button>
                    {linkSent && (
                      <p className="text-sm leading-6 text-muted">
                        Check your inbox. The verification link expires in five
                        minutes.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {challengeId && (
                <form
                  onSubmit={confirm}
                  className="grid gap-5 border-t border-line pt-5"
                >
                  <Field
                    id="code"
                    label="Verification code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                  <Button type="submit">Verify recovery email</Button>
                </form>
              )}
            </>
          ) : null}
        </Card>

        <Card className="grid gap-5">
          <div className="grid gap-1">
            <h2 className="text-lg font-bold text-ink">Recovery codes</h2>
            <p className="text-sm leading-6 text-muted">
              {recoveryCodesConfigured
                ? "Recovery codes are already configured. Generate new codes only if you no longer have the previous set."
                : "Generate single-use codes as a backup if email is unavailable."}
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-11 w-56" />
          ) : loaded ? (
            <Button
              className="w-fit"
              onClick={() =>
                recoveryCodesConfigured
                  ? setConfirmCodeReplacement(true)
                  : setAction({ type: "codes" })
              }
            >
              {recoveryCodesConfigured
                ? "Generate new recovery codes"
                : "Generate recovery codes"}
            </Button>
          ) : null}
        </Card>

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
      </div>
    </SettingsShell>
  );
}
