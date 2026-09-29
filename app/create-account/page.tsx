"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";
import { Fingerprint, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { FocusError } from "@/components/focus-error";
import { PublicAuthGuard } from "@/components/auth/public-auth-guard";
import { AuthPortal } from "@/components/layout/auth-portal";
import { ApiError, jsonRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { GoogleMark } from "@/components/google-mark";
import { Link, useRouter } from "@/i18n/navigation";

type RegistrationOptions = { data: { challengeId: string; options: object } };
type RegistrationResult = {
  data: { authenticated: boolean; isNewAccount: boolean };
};

export default function CreateAccountPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function register() {
    if (!name.trim()) return setError("Enter your name to continue.");
    setLoading(true);
    setError(null);
    try {
      const options = await jsonRequest<RegistrationOptions>(
        "/api/auth/passkey/registration/options",
        { displayName: name.trim() },
      );
      const response = await startRegistration({
        optionsJSON: options.data.options as never,
      });
      const result = await jsonRequest<RegistrationResult>(
        "/api/auth/passkey/registration/verify",
        {
          challengeId: options.data.challengeId,
          response,
        },
      );
      router.push(
        result.data.isNewAccount ? "/security/recovery?onboarding=1" : "/home",
      );
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Passkey registration was cancelled or could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicAuthGuard>
      <AuthPortal>
        <section className="w-full">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <UserRound className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-700">
            {t("createAccountEyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            {t("createAccountTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("createAccountDescription")}
          </p>
          <div className="mt-7 grid gap-4">
            <Field
              id="name"
              label={t("name")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
            <Button onClick={register} loading={loading} className="w-full">
              <Fingerprint className="size-4" aria-hidden="true" />
              {loading ? common("loading") : t("continuePasskey")}
            </Button>
            <div className="flex items-center gap-3 text-xs font-medium text-muted">
              <span className="h-px flex-1 bg-line" />
              {common("or")}
              <span className="h-px flex-1 bg-line" />
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                (window.location.href = `${process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"}/api/auth/google/start?locale=${locale}`)
              }
              disabled={loading}
              className="w-full"
            >
              <GoogleMark />
              {t("continueGoogle")}
            </Button>
            <FocusError message={error} />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            {t("alreadyAccount")}{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              {t("signIn")}
            </Link>
          </p>
        </section>
      </AuthPortal>
    </PublicAuthGuard>
  );
}
