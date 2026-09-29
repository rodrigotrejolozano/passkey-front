import Link from "next/link";
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-extrabold tracking-tight text-ink"
    >
      Passwordless
    </Link>
  );
}
