"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Fingerprint, RefreshCw } from "lucide-react";

import { FocusError } from "@/components/focus-error";
import { AuthPortal } from "@/components/layout/auth-portal";
import { ApiError, apiUrl, protectedJsonRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useRouter } from "@/i18n/navigation";

type RegistrationOptions = { data: { challengeId: string; options: object } };

export default function RestoreAccessPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("recovery");
  const common = useTranslations("common");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function restore() {
    setLoading(true);
    setError(undefined);
    try {
      const options = await protectedJsonRequest<RegistrationOptions>(
        "/api/recovery/restore/passkey/options",
        {},
        "recovery",
      );
      const response = await startRegistration({
        optionsJSON: options.data.options as never,
      });
      await protectedJsonRequest(
        "/api/recovery/restore/passkey/verify",
        { challengeId: options.data.challengeId, response },
        "recovery",
      );
      router.replace("/home");
    } catch (cause) {
      const browserError =
        cause instanceof DOMException && cause.name === "NotAllowedError"
          ? "Passkey creation was cancelled or timed out."
          : cause instanceof DOMException && cause.name === "InvalidStateError"
            ? "This device already has a Passkey for this account."
            : "Passkey restoration could not be completed.";
      setError(cause instanceof ApiError ? cause.message : browserError);
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthPortal>
      <div className="mx-auto max-w-md py-8 sm:py-14">
        <Card className="p-6 sm:p-8">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <RefreshCw className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-700">
            {t("restoreEyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            {t("restoreTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("restoreDescription")}
          </p>
          <div className="mt-7 grid gap-3">
            <Button onClick={restore} loading={loading} className="w-full">
              <Fingerprint className="size-4" aria-hidden="true" />
              {loading ? common("loading") : t("restorePasskey")}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                window.location.assign(
                  apiUrl(`/api/recovery/google/start?locale=${locale}`),
                )
              }
              disabled={loading}
              className="w-full"
            >
              {t("restoreGoogle")}
            </Button>
            <FocusError message={error} />
          </div>
          <Link
            href="/sign-in"
            className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {common("backToSignIn")}
          </Link>
        </Card>
      </div>
    </AuthPortal>
  );
}
