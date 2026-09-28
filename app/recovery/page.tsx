import Link from "next/link";

export default function RecoveryPage() {
  return (
    <main>
      <p className="eyebrow">ACCOUNT RECOVERY</p>
      <h1>Choose a recovery method</h1>
      <p>
        Recovery verifies your identity first. You will restore a sign-in method
        before receiving normal account access.
      </p>
      <Link href="/recovery/email">Use recovery email</Link>
      <Link href="/recovery/code">Use a recovery code</Link>
      <Link href="/sign-in">Back to sign in</Link>
    </main>
  );
}
