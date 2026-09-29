"use client";

import type { ReactNode } from "react";
import { useEffect, useEffectEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError, apiRequest } from "@/lib/api/client";

export function PublicAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const checkSession = useEffectEvent(async () => {
    try {
      await apiRequest("/api/auth/me");
      router.replace("/home");
    } catch (cause) {
      if (!(cause instanceof ApiError) || cause.code === "SESSION_INVALID") {
        setChecking(false);
        return;
      }
      setChecking(false);
    }
  });

  useEffect(() => {
    const check = window.setTimeout(() => void checkSession(), 0);
    return () => window.clearTimeout(check);
  }, []);

  if (!checking) return children;
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5">
      <div className="grid justify-items-center gap-3 text-center">
        <span
          className="size-7 animate-spin rounded-full border-2 border-brand-700 border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-muted">Checking your session</p>
      </div>
    </main>
  );
}
