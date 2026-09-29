"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Fingerprint, LogIn } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { PublicAuthGuard } from "@/components/auth/public-auth-guard";
import { FocusError } from "@/components/focus-error";
import { AuthPortal } from "@/components/layout/auth-portal";
import { ApiError, jsonRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { GoogleMark } from "@/components/google-mark";
import { Link, useRouter } from "@/i18n/navigation";

type AuthenticationOptions = { data: { challengeId: string; options: object } };

export default function SignInPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    setError(null);
    try {
      const options = await jsonRequest<AuthenticationOptions>(
        "/api/auth/passkey/authentication/options",
        {},
      );
      const response = await startAuthentication({
        optionsJSON: options.data.options as never,
      });
      await jsonRequest("/api/auth/passkey/authentication/verify", {
        challengeId: options.data.challengeId,
        response,
      });
      router.push("/home");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Passkey sign-in was cancelled or could not be completed.",
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
            <LogIn className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-700">
            {t("welcomeBack")}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            {t("signInTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("signInDescription")}
          </p>
          <div className="mt-7 grid gap-3">
            <Suspense fallback={null}>
              <SessionExpiredNotice />
            </Suspense>
            <Button onClick={signIn} loading={loading} className="w-full">
              <Fingerprint className="size-4" aria-hidden="true" />
              {loading ? common("loading") : t("signInPasskey")}
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
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5 text-sm">
            <Link
              href="/recovery"
              className="font-semibold text-brand-700 hover:text-brand-800"
            >
              {t("cantAccess")}
            </Link>
            <Link href="/create-account" className="text-muted hover:text-ink">
              {t("createAccount")}
            </Link>
          </div>
        </section>
      </AuthPortal>
    </PublicAuthGuard>
  );
}

function SessionExpiredNotice() {
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  if (searchParams.get("reason") !== "session-expired") return null;
  return (
    <Alert tone="info" role="status">
      {t("sessionExpired")}
    </Alert>
  );
}
