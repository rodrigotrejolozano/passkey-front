import Link from "next/link";

export default async function AuthResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const success = (await searchParams).status === "success";
  return (
    <main>
      <p className="eyebrow">GOOGLE</p>
      <h1>
        {success
          ? "Authentication complete."
          : "Authentication could not be completed."}
      </h1>
      <Link href={success ? "/home" : "/sign-in"}>
        {success ? "Continue" : "Try again"}
      </Link>
    </main>
  );
}
