import Link from "next/link";

export default async function AuthResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; flow?: string; new?: string }>;
}) {
  const parameters = await searchParams;
  const success = parameters.status === "success";
  const recovery = parameters.flow === "recovery";
  const accountRecovery = parameters.flow === "account-recovery";
  const recoveryEmail = parameters.flow === "recovery-email";
  const destination =
    success && accountRecovery
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
          : "GOOGLE"}
      </p>
      <h1>
        {success
          ? accountRecovery
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
