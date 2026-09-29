"use client";

import { FormEvent, useEffect, useState } from "react";

import { SettingsShell } from "@/components/layout/settings-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiRequest, protectedRequest } from "@/lib/api/client";

type ProfileResponse = { data: { displayName: string; createdAt: string } };

function errorMessage(cause: unknown) {
  return cause instanceof ApiError
    ? cause.message
    : "Your profile could not be updated. Please try again.";
}

export default function ProfilePage() {
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
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Your profile could not be loaded. Please try again.",
        ),
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
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsShell>
      <div className="grid w-full gap-6">
        <section className="grid gap-2">
          <p className="eyebrow">PROFILE</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Your profile
          </h1>
          <p className="leading-7 text-muted">
            Keep your account details accurate and recognizable.
          </p>
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
                label="Display name"
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setSaved(false);
                }}
                required
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
                {saved && <p role="status">Profile updated.</p>}
              </div>
            </form>
          ) : (
            <Alert tone="error" role="alert">
              {error ?? "Your profile could not be loaded. Please try again."}
            </Alert>
          )}
        </Card>
      </div>
    </SettingsShell>
  );
}
