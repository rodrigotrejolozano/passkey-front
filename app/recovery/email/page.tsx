"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Check, Mail } from "lucide-react";

import { FocusError } from "@/components/focus-error";
import { AuthPortal } from "@/components/layout/auth-portal";
import { ApiError, jsonRequest } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { OtpInput } from "@/components/otp-input";
import { Link, useRouter } from "@/i18n/navigation";

type DeliveryMethod = "OTP" | "MAGIC_LINK";

export default function RecoveryEmailPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("recovery");
  const common = useTranslations("common");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("OTP");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function request(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/request", {
        email,
        deliveryMethod,
        locale,
      });
      setRequested(true);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery instructions could not be requested.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/verify", { email, code });
      router.replace("/restore-access");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery could not be verified.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setLoading(true);
    setError(undefined);
    try {
      await jsonRequest("/api/recovery/request", {
        email,
        deliveryMethod: "OTP",
        locale,
      });
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Recovery instructions could not be requested.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPortal>
      <div className="mx-auto max-w-lg py-8 sm:py-14">
        <Card className="p-6 sm:p-8">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <Mail className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-700">
            {t("emailEyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
            {t("emailHeading")}
          </h1>
          <ol
            className="mt-6 flex items-center gap-2"
            aria-label={t("eyebrow")}
          >
            <Step
              number="1"
              label={t("emailHeading")}
              active={!requested}
              complete={requested}
            />
            <div className="h-px flex-1 bg-line" aria-hidden="true" />
            <Step number="2" label={t("restoreEyebrow")} active={requested} />
          </ol>
          {!requested ? (
            <form onSubmit={request} className="mt-7 grid gap-4">
              <p className="text-sm leading-6 text-muted">
                {t("emailNeutral")}
              </p>
              <Field
                id="email"
                label={t("recoveryEmail")}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <div className="grid gap-2">
                <label
                  htmlFor="delivery-method"
                  className="text-sm font-semibold text-ink"
                >
                  {t("deliveryMethod")}
                </label>
                <select
                  id="delivery-method"
                  value={deliveryMethod}
                  onChange={(event) =>
                    setDeliveryMethod(event.target.value as DeliveryMethod)
                  }
                  className="min-h-11 rounded-xl border border-line bg-white px-3 text-ink shadow-sm outline-none transition focus:border-brand-600 focus:ring-3 focus:ring-brand-100"
                >
                  <option value="OTP">{t("verificationCode")}</option>
                  <option value="MAGIC_LINK">{t("magicLink")}</option>
                </select>
              </div>
              <Button type="submit" loading={loading} className="mt-1 w-full">
                {loading ? common("sending") : t("sendInstructions")}
              </Button>
            </form>
          ) : deliveryMethod === "OTP" ? (
            <form onSubmit={verify} className="mt-7 grid gap-4">
              <p className="text-sm leading-6 text-muted">
                {t("codeSent", { email })}
              </p>
              <OtpInput
                value={code}
                onChange={setCode}
                error={Boolean(error)}
              />
              <Button
                type="submit"
                loading={loading}
                disabled={code.length !== 6}
                className="w-full"
              >
                {loading ? common("verifying") : t("verifyCode")}
              </Button>
              <button
                type="button"
                onClick={() => void resend()}
                disabled={loading}
                className="justify-self-center text-sm font-semibold text-brand-700 hover:text-brand-800 disabled:opacity-60"
              >
                {t("sendAnother")}
              </button>
            </form>
          ) : (
            <Alert tone="success" className="mt-7">
              {t("linkSent", { email })}
            </Alert>
          )}
          <FocusError message={error} />
        </Card>
        <Link
          href="/sign-in"
          className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {common("backToSignIn")}
        </Link>
      </div>
    </AuthPortal>
  );
}

function Step({
  number,
  label,
  active = false,
  complete = false,
}: {
  number: string;
  label: string;
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <li className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-muted">
      <span
        className={`flex size-6 items-center justify-center rounded-full ${active || complete ? "bg-brand-700 text-white" : "bg-line text-muted"}`}
      >
        {complete ? <Check className="size-3.5" aria-hidden="true" /> : number}
      </span>
      <span className={active || complete ? "text-ink" : undefined}>
        {label}
      </span>
    </li>
  );
}
