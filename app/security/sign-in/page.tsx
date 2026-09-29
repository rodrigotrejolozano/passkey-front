"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { KeyRound, Pencil, Plus, Trash2, Unplug } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

import { SettingsShell } from "@/components/layout/settings-shell";
import { PasskeyRenameDialog } from "@/components/passkey-rename-dialog";
import { StepUpDialog } from "@/components/step-up-dialog";
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

type Passkey = { id: string; name: string; createdAt: string };
type PasskeyResponse = { data: { passkeys: Passkey[] } };
type GoogleResponse = {
  data: { identity: { providerEmail: string | null } | null };
};
type RegistrationOptions = { data: { challengeId: string; options: object } };
type PendingAction = {
  execute: () => Promise<void>;
  resume?: "add-passkey";
};
const STEP_UP_RESUME_KEY = "passkey.sign-in-step-up";

function errorMessage(cause: unknown) {
  return cause instanceof ApiError
    ? cause.message
    : "Your sign-in methods could not be loaded. Please try again.";
}

export default function SignInMethodsPage() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [google, setGoogle] =
    useState<GoogleResponse["data"]["identity"]>(null);
  const [action, setAction] = useState<PendingAction>();
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string>();
  const [renaming, setRenaming] = useState<Passkey>();
  const resumePasskey = useEffectEvent(() => {
    void addPasskey().catch((cause) => setError(errorMessage(cause)));
  });

  async function load() {
    setLoading(true);
    setError(undefined);
    try {
      const [keys, identity] = await Promise.all([
        apiRequest<PasskeyResponse>("/api/security/passkeys"),
        apiRequest<GoogleResponse>("/api/security/google"),
      ]);
      setPasskeys(keys.data.passkeys);
      setGoogle(identity.data.identity);
      setLoaded(true);
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

  useEffect(() => {
    const stepUp = new URLSearchParams(window.location.search).get("stepUp");
    if (stepUp !== "complete") {
      if (stepUp === "failed")
        window.sessionStorage.removeItem(STEP_UP_RESUME_KEY);
      return;
    }
    const resume = window.sessionStorage.getItem(STEP_UP_RESUME_KEY);
    window.sessionStorage.removeItem(STEP_UP_RESUME_KEY);
    window.history.replaceState(null, "", "/security/sign-in");
    if (resume !== "add-passkey") return;
    resumePasskey();
  }, []);

  async function addPasskey() {
    const options = await protectedJsonRequest<RegistrationOptions>(
      "/api/security/passkeys/options",
      {},
    );
    const response = await startRegistration({
      optionsJSON: options.data.options as never,
    });
    await protectedJsonRequest("/api/security/passkeys/verify", {
      challengeId: options.data.challengeId,
      response,
    });
    await load();
  }

  async function removePasskey(id: string) {
    await protectedRequest(`/api/security/passkeys/${id}`, {
      method: "DELETE",
    });
    await load();
  }

  function openRenameDialog(id: string) {
    const current = passkeys.find((passkey) => passkey.id === id);
    if (current) setRenaming(current);
  }

  async function renamePasskey(id: string, name: string) {
    await protectedRequest(`/api/security/passkeys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await load();
  }

  async function disconnectGoogle() {
    await protectedRequest("/api/security/google", { method: "DELETE" });
    await load();
  }

  function connectGoogle() {
    window.location.assign(
      `${process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"}/api/security/google/connect`,
    );
    return Promise.resolve();
  }

  return (
    <SettingsShell>
      <div className="grid gap-6">
        <section className="grid gap-2">
          <p className="eyebrow">SIGN-IN METHODS</p>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Passkeys
          </h1>
          <p className="leading-7 text-muted">
            Choose the secure methods that can access your account.
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
              <h2 className="text-lg font-bold text-ink">Your Passkeys</h2>
              <p className="text-sm leading-6 text-muted">
                Use a Passkey to sign in without a password.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() =>
                setAction({ execute: addPasskey, resume: "add-passkey" })
              }
              disabled={loading}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Passkey
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !loaded ? null : passkeys.length ? (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {passkeys.map((passkey) => (
                <li
                  key={passkey.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-800">
                      <KeyRound className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {passkey.name}
                      </p>
                      <p className="text-sm text-muted">
                        Created{" "}
                        {new Date(passkey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setAction({
                          execute: async () => openRenameDialog(passkey.id),
                        })
                      }
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setAction({
                          execute: () => removePasskey(passkey.id),
                        })
                      }
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : !loaded ? null : (
            <EmptyState
              title="No Passkeys yet"
              description="Add a Passkey to create a fast, phishing-resistant sign-in method."
            />
          )}
        </Card>

        <Card className="grid gap-5">
          <div className="grid gap-1">
            <h2 className="text-lg font-bold text-ink">Google</h2>
            <p className="text-sm leading-6 text-muted">
              Use a linked Google account as another sign-in option.
            </p>
          </div>
          {loading ? (
            <Skeleton className="h-11 w-full" />
          ) : !loaded ? null : (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line px-4 py-4">
              <div className="grid gap-1">
                <p className="font-semibold text-ink">
                  {google?.providerEmail ?? "Not connected"}
                </p>
                <Badge>{google ? "Connected" : "Not connected"}</Badge>
              </div>
              {google ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAction({ execute: disconnectGoogle })}
                >
                  <Unplug className="size-4" aria-hidden="true" />
                  Disconnect Google
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAction({ execute: connectGoogle })}
                >
                  Connect Google
                </Button>
              )}
            </div>
          )}
        </Card>

        {action && (
          <StepUpDialog
            onCancel={() => setAction(undefined)}
            onVerified={async () => {
              await action.execute();
              setAction(undefined);
            }}
            onGoogleRedirect={() => {
              if (action.resume)
                window.sessionStorage.setItem(
                  STEP_UP_RESUME_KEY,
                  action.resume,
                );
            }}
          />
        )}
        {renaming && (
          <PasskeyRenameDialog
            passkey={renaming}
            onCancel={() => setRenaming(undefined)}
            onSave={renamePasskey}
          />
        )}
      </div>
    </SettingsShell>
  );
}
