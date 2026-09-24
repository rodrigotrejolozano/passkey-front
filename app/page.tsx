import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <p className="eyebrow">PASSWORDLESS</p>
      <h1>Authentication without passwords.</h1>
      <p>
        No passwords to remember. No passwords to leak. No passwords to reset.
      </p>
      <nav aria-label="Authentication actions">
        <Link href="/create-account">Create account</Link>
        <Link href="/sign-in">Sign in</Link>
      </nav>
    </main>
  );
}
