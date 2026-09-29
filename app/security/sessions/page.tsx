"use client";

import { Laptop, LogOut, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { SettingsShell } from "@/components/layout/settings-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  apiRequest,
  protectedJsonRequest,
  protectedRequest,
} from "@/lib/api/client";

type SessionsResponse = {
  data: {
    currentSessionId: string;
    sessions: Array<{
      id: string;
      lastSeenAt: string;
      userAgent: string | null;
    }>;
  };
};

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof ApiError ? cause.message : fallback;
}

export default function SessionsPage() {
  const t = useTranslations("sessions");
  const [data, setData] = useState<SessionsResponse["data"]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [revoking, setRevoking] = useState<string>();

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const result = await apiRequest<SessionsResponse>("/api/sessions");
      setData(result.data);
    } catch (cause) {
      setError(errorMessage(cause, t("error")));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function revokeOthers() {
    setRevoking("others");
    setError(undefined);
    try {
      await protectedJsonRequest("/api/sessions/revoke-others", {});
      await load();
    } catch (cause) {
      setError(errorMessage(cause, t("error")));
    } finally {
      setRevoking(undefined);
    }
  }

  async function revoke(id: string) {
    setRevoking(id);
    setError(undefined);
    try {
      await protectedRequest(`/api/sessions/${id}`, { method: "DELETE" });
      await load();
    } catch (cause) {
      setError(errorMessage(cause, t("error")));
    } finally {
      setRevoking(undefined);
    }
  }

  const otherSessions =
    data?.sessions.filter((session) => session.id !== data.currentSessionId) ??
    [];

  return (
    <SettingsShell>
      <div className="grid gap-6">
        <section className="grid gap-2">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {t("title")}
          </h1>
          <p className="leading-7 text-muted">{t("description")}</p>
        </section>

        {error && (
          <Alert tone="error" role="alert">
            {error}
          </Alert>
        )}

        <Card className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <h2 className="text-lg font-bold text-ink">{t("activeTitle")}</h2>
              <p className="text-sm leading-6 text-muted">
                {t("currentAvailable")}
              </p>
            </div>
            {otherSessions.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                loading={revoking === "others"}
                disabled={Boolean(revoking)}
                onClick={() => void revokeOthers()}
              >
                {t("revokeOthers")}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : data?.sessions.length ? (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {data.sessions.map((session) => {
                const current = session.id === data.currentSessionId;
                return (
                  <li
                    key={session.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-800">
                        {current ? (
                          <ShieldCheck className="size-4" aria-hidden="true" />
                        ) : (
                          <Laptop className="size-4" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {current
                            ? t("currentSession")
                            : (session.userAgent ?? t("unknownDevice"))}
                        </p>
                        <p className="text-sm text-muted">
                          {t("lastActive", {
                            date: new Date(session.lastSeenAt).toLocaleString(),
                          })}
                        </p>
                      </div>
                    </div>
                    {current ? (
                      <Badge>{t("current")}</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={revoking === session.id}
                        disabled={Boolean(revoking)}
                        onClick={() => void revoke(session.id)}
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        {t("revoke")}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : data ? (
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          ) : null}
        </Card>
      </div>
    </SettingsShell>
  );
}
