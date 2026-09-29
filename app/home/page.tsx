"use client";

import { KeyRound, RotateCcwKey, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { AuthenticatedShell } from "@/components/layout/authenticated-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiRequest } from "@/lib/api/client";
import { Link, useRouter } from "@/i18n/navigation";

type MeResponse = {
  data: { user: { displayName: string }; authMethod: "PASSKEY" | "GOOGLE" };
};

export default function AuthenticatedHome() {
  const router = useRouter();
  const t = useTranslations("home");
  const destinations = [
    ["/security/sign-in", "methodsCard", "methodsCardDescription", KeyRound],
    [
      "/security/sessions",
      "sessionsCard",
      "sessionsCardDescription",
      ShieldCheck,
    ],
    [
      "/security/recovery",
      "recoveryCard",
      "recoveryCardDescription",
      RotateCcwKey,
    ],
  ] as const;
  const [name, setName] = useState<string>();
  const [authMethod, setAuthMethod] = useState<"PASSKEY" | "GOOGLE">();

  useEffect(() => {
    apiRequest<MeResponse>("/api/auth/me")
      .then((result) => {
        setName(result.data.user.displayName);
        setAuthMethod(result.data.authMethod);
      })
      .catch((cause) =>
        router.replace(
          cause instanceof ApiError && cause.code === "SESSION_INVALID"
            ? "/sign-in?reason=session-expired"
            : "/sign-in",
        ),
      );
  }, [router]);

  return (
    <AuthenticatedShell>
      <article className="grid gap-8">
        <section className="grid gap-4 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <p className="eyebrow">{t("eyebrow")}</p>
          {name ? (
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t("welcome", { name })}
            </h1>
          ) : (
            <Skeleton className="h-10 w-72" />
          )}
          {authMethod ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge>
                {authMethod === "GOOGLE"
                  ? t("googleSignIn")
                  : t("passkeySignIn")}
              </Badge>
              <p className="text-sm leading-6 text-muted">
                {authMethod === "GOOGLE"
                  ? t("googleSession")
                  : t("passkeySession")}
              </p>
            </div>
          ) : (
            <Skeleton className="h-6 w-64" />
          )}
        </section>

        <section className="grid gap-5 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              {t("whyTitle")}
            </h2>
            <p className="leading-7 text-muted">{t("passkeyProof")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50 p-5">
              <h3 className="font-bold text-brand-900">{t("noSecret")}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t("noSecretDescription")}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-5">
              <h3 className="font-bold text-brand-900">{t("siteSpecific")}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t("siteSpecificDescription")}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              {t("howTitle")}
            </h2>
            <p className="leading-7 text-muted">
              {t("authenticationDescription")}
            </p>
          </div>
          <ol className="grid gap-3 text-sm leading-6 text-muted sm:grid-cols-3">
            <li className="rounded-2xl border border-line p-4">
              <strong className="block text-ink">{t("verify")}</strong>
              {t("verifyDescription")}
            </li>
            <li className="rounded-2xl border border-line p-4">
              <strong className="block text-ink">{t("protect")}</strong>
              {t("protectDescription")}
            </li>
            <li className="rounded-2xl border border-line p-4">
              <strong className="block text-ink">{t("recover")}</strong>
              {t("recoverDescription")}
            </li>
          </ol>
        </section>

        <section className="grid gap-5 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              {t("openTitle")}
            </h2>
            <p className="leading-7 text-muted">{t("openDescription")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line p-5">
              <h3 className="font-bold text-ink">{t("practicalSecurity")}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t("practicalSecurityDescription")}
              </p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <h3 className="font-bold text-ink">{t("lessFriction")}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t("lessFrictionDescription")}
              </p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <h3 className="font-bold text-ink">{t("visibleControl")}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t("visibleControlDescription")}
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label={t("settings")}
          className="grid gap-4 sm:grid-cols-2"
        >
          {destinations.map(([href, title, description, Icon]) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full group-hover:border-brand-300 group-hover:bg-brand-50/40">
                <div className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-800">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="grid gap-1">
                    <h2 className="font-bold text-ink">{t(title)}</h2>
                    <p className="text-sm leading-6 text-muted">
                      {t(description)}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      </article>
    </AuthenticatedShell>
  );
}
