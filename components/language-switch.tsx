"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export function LanguageSwitch() {
  const locale = useLocale();
  const t = useTranslations("language");
  const nextLocale = locale === "es" ? "en" : "es";

  function switchLocale() {
    const { pathname, search, hash } = window.location;
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    window.location.assign(`${segments.join("/")}${search}${hash}`);
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t("switch")}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-bold text-ink transition hover:border-brand-300 hover:bg-brand-50"
    >
      <Languages className="size-4 text-brand-700" aria-hidden="true" />
      <span className={locale === "es" ? "text-brand-700" : "text-muted"}>
        ES
      </span>
      <span className="text-line">/</span>
      <span className={locale === "en" ? "text-brand-700" : "text-muted"}>
        EN
      </span>
    </button>
  );
}
