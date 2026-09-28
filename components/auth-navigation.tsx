import Link from "next/link";

export function AuthNavigation() {
  return (
    <nav aria-label="Authenticated navigation">
      <Link href="/home">Home</Link>
      <Link href="/security/sign-in">Sign-in methods</Link>
      <Link href="/security/sessions">Sessions</Link>
      <Link href="/profile">Profile</Link>
    </nav>
  );
}
