"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/profile", "Profile"],
  ["/security/sign-in", "Sign-in methods"],
  ["/security/sessions", "Sessions"],
  ["/security/recovery", "Recovery"],
] as const;

export function SettingsNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Settings navigation"
      className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0"
    >
      <div className="flex w-max min-w-full gap-1 rounded-xl border border-line bg-white p-1 sm:min-w-0">
        {links.map(([href, label]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-brand-700 text-white shadow-sm" : "text-muted hover:bg-canvas hover:text-ink"}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
