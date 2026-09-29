"use client";

import type { ReactNode } from "react";
import { useEffect, useEffectEvent, useState } from "react";
import { useTranslations } from "next-intl";

import { ApiError, apiRequest } from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";

const SESSION_INVALID_EVENT = "passkey:session-invalid";

export function SessionBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  const t = useTranslations("common");
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid] = useState(false);

  const redirectToSignIn = useEffectEvent(() => {
    setInvalid(true);
    router.replace("/sign-in?reason=session-expired");
  });

  const verify = useEffectEvent(async (initial: boolean) => {
    try {
      await apiRequest("/api/auth/me");
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === "SESSION_INVALID") {
        redirectToSignIn();
        return;
      }
    } finally {
      if (initial) setChecking(false);
    }
  });

  useEffect(() => {
    const initialCheck = window.setTimeout(() => void verify(true), 0);
    const interval = window.setInterval(() => void verify(false), 30_000);
    function verifyOnVisibility() {
      if (document.visibilityState === "visible") void verify(false);
    }
    window.addEventListener(SESSION_INVALID_EVENT, redirectToSignIn);
    document.addEventListener("visibilitychange", verifyOnVisibility);
    return () => {
      window.clearTimeout(initialCheck);
      window.clearInterval(interval);
      window.removeEventListener(SESSION_INVALID_EVENT, redirectToSignIn);
      document.removeEventListener("visibilitychange", verifyOnVisibility);
    };
  }, []);

  if (checking || invalid) {
    return (
      <section className="grid min-h-72 place-items-center" role="status">
        <div className="grid justify-items-center gap-3 text-center">
          <span
            className="size-7 animate-spin rounded-full border-2 border-brand-700 border-t-transparent"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-muted">
            {t("checkingSession")}
          </p>
        </div>
      </section>
    );
  }

  return children;
}

export { SESSION_INVALID_EVENT };
