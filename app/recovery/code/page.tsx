"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";

import { FocusError } from "@/components/focus-error";
import { AuthPortal } from "@/components/layout/auth-portal";
import { ApiError, jsonRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Link, useRouter } from "@/i18n/navigation";

export default function RecoveryCodePage() {
  const router = useRouter();
  const t = useTranslations("recovery");
  const common = useTranslations("common");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/code", { code });
      router.replace("/restore-access");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery code could not be verified.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthPortal>
      <div className="mx-auto max-w-md py-8 sm:py-14">
        <Card className="p-6 sm:p-8">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <KeyRound className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-700">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            {t("codeTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {t("useCodeDescription")}
          </p>
          <form onSubmit={verify} className="mt-7 grid gap-4">
            <Field
              id="code"
              label={t("codeLabel")}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              {loading ? common("verifying") : t("verifyRecoveryCode")}
            </Button>
            <FocusError message={error} />
          </form>
          <Link
            href="/recovery/email"
            className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {t("useEmailInstead")}
          </Link>
        </Card>
      </div>
    </AuthPortal>
  );
}
