import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function Brand({ href = "/" }: { href?: string }) {
  const t = useTranslations("common");
  return (
    <Link
      href={href}
      className="text-sm font-extrabold tracking-tight text-ink"
    >
      {t("passwordless")}
    </Link>
  );
}
