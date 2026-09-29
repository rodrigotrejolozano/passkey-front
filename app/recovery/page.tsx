import { ChevronRight, Mail, ShieldCheck, Ticket } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthPortal } from "@/components/layout/auth-portal";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default function RecoveryPage() {
  const t = useTranslations("recovery");
  const common = useTranslations("common");
  return (
    <AuthPortal>
      <div className="w-full">
        <div className="text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-bold tracking-[0.16em] text-brand-700">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
            {t("chooseTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
            {t("chooseDescription")}
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <RecoveryOption
            href="/recovery/email"
            icon={Mail}
            title={t("emailTitle")}
            description={t("emailDescription")}
          />
          <RecoveryOption
            href="/recovery/code"
            icon={Ticket}
            title={t("codeTitle")}
            description={t("codeDescription")}
          />
        </div>
        <Link
          href="/sign-in"
          className="mx-auto mt-7 block w-fit text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {common("backToSignIn")}
        </Link>
      </div>
    </AuthPortal>
  );
}

function RecoveryOption({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Mail;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full p-5 transition-colors hover:border-brand-300 hover:bg-brand-50 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <ChevronRight
            className="mt-2 size-4 text-muted transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
        <h2 className="mt-5 font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </Card>
    </Link>
  );
}
