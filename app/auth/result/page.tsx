import Link from "next/link";

export default async function AuthResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; flow?: string; new?: string }>;
}) {
  const parameters = await searchParams;
  const success = parameters.status === "success";
  const recovery = parameters.flow === "recovery";
  const destination =
    success && parameters.new === "1"
      ? "/security/recovery?onboarding=1"
      : success
        ? "/home"
        : "/sign-in";
  return (
    <main>
      <p className="eyebrow">{recovery ? "ACCESS RESTORED" : "GOOGLE"}</p>
      <h1>
        {success
          ? recovery
            ? "Your Google account can now sign you in."
            : "Authentication complete."
          : "Authentication could not be completed."}
      </h1>
      <Link href={destination}>{success ? "Continue" : "Try again"}</Link>
    </main>
  );
}
