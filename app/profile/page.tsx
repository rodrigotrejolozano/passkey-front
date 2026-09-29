"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { SettingsShell } from "@/components/layout/settings-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiRequest, protectedRequest } from "@/lib/api/client";

type ProfileResponse = { data: { displayName: string; createdAt: string } };

function errorMessage(cause: unknown, fallback: string) {
  return cause instanceof ApiError ? cause.message : fallback;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    apiRequest<ProfileResponse>("/api/security/profile")
      .then((result) => {
        setDisplayName(result.data.displayName);
        setLoaded(true);
      })
      .catch((cause) =>
        setError(cause instanceof ApiError ? cause.message : t("loadError")),
      )
      .finally(() => setLoading(false));
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(undefined);
    try {
      await protectedRequest("/api/security/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      setSaved(true);
    } catch (cause) {
      setError(errorMessage(cause, t("saveError")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsShell>
      <div className="grid w-full gap-6">
        <section className="grid gap-2">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {t("title")}
          </h1>
          <p className="leading-7 text-muted">{t("description")}</p>
        </section>

        <Card>
          {loading ? (
            <div className="grid gap-5">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-36" />
            </div>
          ) : loaded ? (
            <form onSubmit={save} className="grid gap-5">
              {error && (
                <Alert tone="error" role="alert">
                  {error}
                </Alert>
              )}
              <Field
                id="displayName"
                label={t("displayName")}
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setSaved(false);
                }}
                required
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={saving}>
                  {t("save")}
                </Button>
                {saved && <p role="status">{t("saved")}</p>}
              </div>
            </form>
          ) : (
            <Alert tone="error" role="alert">
              {error ?? t("loadError")}
            </Alert>
          )}
        </Card>
      </div>
    </SettingsShell>
  );
}
