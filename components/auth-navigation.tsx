"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

export function AuthNavigation() {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const [open, setOpen] = useState(false);
  const links = [
    ["/home", t("home")],
    ["/security/sign-in", t("settings")],
  ] as const;
  return (
    <nav aria-label={t("authenticated")} className="relative">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink sm:hidden"
        aria-expanded={open}
        aria-controls="authenticated-navigation-links"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="sr-only">{t("toggle")}</span>
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>
      <div
        id="authenticated-navigation-links"
        className={`absolute right-0 top-12 z-20 w-56 gap-1 rounded-xl border border-line bg-white p-2 shadow-panel sm:static sm:flex sm:w-auto sm:items-center sm:gap-1 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none ${open ? "grid" : "hidden"}`}
      >
        {links.map(([href, label]) => {
          const active =
            href === "/home" ? pathname === href : pathname !== "/home";
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-brand-50 text-brand-800" : "text-muted hover:bg-canvas hover:text-ink"}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
