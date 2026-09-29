"use client";

import { Laptop, LogOut, ShieldCheck } from "lucide-react";
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

function errorMessage(cause: unknown) {
  return cause instanceof ApiError
    ? cause.message
    : "Your sessions could not be updated. Please try again.";
}

export default function SessionsPage() {
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
      setError(errorMessage(cause));
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
      setError(errorMessage(cause));
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
      setError(errorMessage(cause));
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
          <p className="eyebrow">ACTIVE SESSIONS</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Your devices
          </h1>
          <p className="leading-7 text-muted">
            Review and remove devices that no longer need access.
          </p>
        </section>

        {error && (
          <Alert tone="error" role="alert">
            {error}
          </Alert>
        )}

        <Card className="grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <h2 className="text-lg font-bold text-ink">Active sessions</h2>
              <p className="text-sm leading-6 text-muted">
                Your current session remains available on this device.
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
                Revoke all other sessions
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
                            ? "Current session"
                            : (session.userAgent ?? "Unknown device")}
                        </p>
                        <p className="text-sm text-muted">
                          Last active{" "}
                          {new Date(session.lastSeenAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {current ? (
                      <Badge>Current</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={revoking === session.id}
                        disabled={Boolean(revoking)}
                        onClick={() => void revoke(session.id)}
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        Revoke
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : data ? (
            <EmptyState
              title="No active sessions"
              description="There are no devices with active access to your account."
            />
          ) : null}
        </Card>
      </div>
    </SettingsShell>
  );
}
