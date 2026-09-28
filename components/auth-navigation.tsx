"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthNavigation() {
  const pathname = usePathname();
  const links = [
    ["/home", "Home"],
    ["/security/sign-in", "Sign-in methods"],
    ["/security/sessions", "Sessions"],
    ["/security/recovery", "Recovery"],
    ["/profile", "Profile"],
  ] as const;
  return (
    <nav aria-label="Authenticated navigation">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
