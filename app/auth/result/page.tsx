import Link from "next/link";

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
    <main>
      <p className="eyebrow">
        {recovery || accountRecovery || recoveryEmail
          ? "ACCOUNT RECOVERY"
          : stepUp
            ? "SECURITY CHECK"
            : "GOOGLE"}
      </p>
      <h1>
        {googleAlreadyLinked
          ? "This Google account is already linked to another user."
          : googleAccountMismatch
            ? "Use the Google account linked to this user."
            : success
              ? stepUp
                ? "Identity verification complete. Repeat your security action."
                : accountRecovery
                  ? "Recovery email verified."
                  : recoveryEmail
                    ? "Your recovery email is verified."
                    : recovery
                      ? "Your Google account can now sign you in."
                      : "Authentication complete."
              : "Authentication could not be completed."}
      </h1>
      <Link href={destination}>{success ? "Continue" : "Try again"}</Link>
    </main>
  );
}
