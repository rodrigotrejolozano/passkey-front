import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { PublicAuthGuard } from "@/components/auth/public-auth-guard";
import { AuthPortal } from "@/components/layout/auth-portal";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  return (
    <PublicAuthGuard>
      <AuthPortal>
        <section className="grid w-full gap-7">
          <div className="grid gap-3">
            <p className="text-xs font-bold tracking-[0.16em] text-brand-700">
              {t("access")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t("landingTitle")}
            </h1>
            <p className="leading-7 text-muted">{t("landingDescription")}</p>
          </div>
          <nav
            aria-label={common("authenticationActions")}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Link
              href="/create-account"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              {t("createAccount")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-mint hover:bg-white"
            >
              {t("signIn")}
            </Link>
          </nav>
        </section>
      </AuthPortal>
    </PublicAuthGuard>
  );
}
