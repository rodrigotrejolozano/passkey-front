import Link from "next/link";
import { CheckCircle2, CircleX } from "lucide-react";

import { PublicShell } from "@/components/layout/public-shell";
import { Card } from "@/components/ui/card";

export default async function AuthResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    flow?: string;
    new?: string;
    source?: string;
    reason?: string;
  }>;
}) {
  const parameters = await searchParams;
  const success = parameters.status === "success";
  const recovery = parameters.flow === "recovery";
  const stepUp = parameters.flow === "step-up";
  const accountRecovery = parameters.flow === "account-recovery";
  const recoveryEmail = parameters.flow === "recovery-email";
  const linking = parameters.flow === "link";
  const googleAlreadyLinked =
    linking && parameters.reason === "google-already-linked";
  const googleAccountMismatch =
    stepUp && parameters.reason === "google-account-mismatch";
  const destination = stepUp
    ? parameters.source === "recovery"
      ? success
        ? "/security/recovery?stepUp=complete"
        : "/security/recovery?stepUp=failed"
      : success
        ? "/security/sign-in?stepUp=complete"
        : "/security/sign-in?stepUp=failed"
    : linking
      ? "/security/sign-in"
      : success && accountRecovery
        ? "/restore-access"
        : success && recoveryEmail
          ? "/security/recovery"
          : success && parameters.new === "1"
            ? "/security/recovery?onboarding=1"
            : success
              ? "/home"
              : recovery
                ? "/restore-access"
                : accountRecovery
                  ? "/recovery/email"
                  : recoveryEmail
                    ? "/security/recovery"
                    : "/sign-in";
  return (
    <PublicShell>
      <div className="mx-auto max-w-md py-8 sm:py-14">
        <Card className="p-6 text-center sm:p-8">
          <div
            className={`mx-auto flex size-14 items-center justify-center rounded-full ${success ? "bg-brand-100 text-brand-800" : "bg-danger-50 text-danger-600"}`}
          >
            {success ? (
              <CheckCircle2 className="size-7" aria-hidden="true" />
            ) : (
              <CircleX className="size-7" aria-hidden="true" />
            )}
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-700">
            {recovery || accountRecovery || recoveryEmail
              ? "ACCOUNT RECOVERY"
              : stepUp
                ? "SECURITY CHECK"
                : "GOOGLE"}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            {googleAlreadyLinked
              ? "This Google account is already linked to another user."
              : googleAccountMismatch
                ? "Use the Google account linked to this user."
                : success
                  ? stepUp
                    ? parameters.source === "recovery"
                      ? "Identity verification complete. Continue to finish your security action."
                      : "Identity verification complete. Repeat your security action."
                    : accountRecovery
                      ? "Recovery email verified."
                      : recoveryEmail
                        ? "Your recovery email is verified."
                        : recovery
                          ? "Your Google account can now sign you in."
                          : "Authentication complete."
                  : "Authentication could not be completed."}
          </h1>
          <Link
            href={destination}
            className={`mt-7 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors ${success ? "bg-brand-700 text-white hover:bg-brand-800" : "bg-danger-600 text-white hover:bg-danger-700"}`}
          >
            {success ? "Continue" : "Try again"}
          </Link>
        </Card>
      </div>
    </PublicShell>
  );
}
