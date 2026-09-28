"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useEffect, useState } from "react";

import { AuthNavigation } from "@/components/auth-navigation";
import { StepUpDialog } from "@/components/step-up-dialog";
import { apiRequest, jsonRequest } from "@/lib/api/client";

type Passkey = { id: string; name: string; createdAt: string };
type PasskeyResponse = { data: { passkeys: Passkey[] } };
type GoogleResponse = {
  data: { identity: { providerEmail: string | null } | null };
};
type RegistrationOptions = { data: { challengeId: string; options: object } };

export default function SignInMethodsPage() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [google, setGoogle] =
    useState<GoogleResponse["data"]["identity"]>(null);
  const [action, setAction] = useState<() => Promise<void>>();
  const load = () =>
    Promise.all([
      apiRequest<PasskeyResponse>("/api/security/passkeys"),
      apiRequest<GoogleResponse>("/api/security/google"),
    ]).then(([keys, identity]) => {
      setPasskeys(keys.data.passkeys);
      setGoogle(identity.data.identity);
    });
  useEffect(() => {
    void load();
  }, []);
  async function addPasskey() {
    const options = await jsonRequest<RegistrationOptions>(
      "/api/security/passkeys/options",
      {},
    );
    const response = await startRegistration({
      optionsJSON: options.data.options as never,
    });
    await jsonRequest("/api/security/passkeys/verify", {
      challengeId: options.data.challengeId,
      response,
    });
    await load();
  }
  async function removePasskey(id: string) {
    await apiRequest(`/api/security/passkeys/${id}`, { method: "DELETE" });
    await load();
  }
  async function disconnectGoogle() {
    await apiRequest("/api/security/google", { method: "DELETE" });
    await load();
  }
  function connectGoogle() {
    window.location.assign(
      `${process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"}/api/security/google/connect`,
    );
    return Promise.resolve();
  }
  return (
    <main>
      <AuthNavigation />
      <p className="eyebrow">SIGN-IN METHODS</p>
      <h1>Passkeys</h1>
      {passkeys.map((passkey) => (
        <p key={passkey.id}>
          {passkey.name} · Created{" "}
          {new Date(passkey.createdAt).toLocaleDateString()}{" "}
          <button
            onClick={() => setAction(() => () => removePasskey(passkey.id))}
          >
            Remove
          </button>
        </p>
      ))}
      <button onClick={() => setAction(() => addPasskey)}>Add Passkey</button>
      <h2>Google</h2>
      <p>{google?.providerEmail ?? "Not connected"}</p>
      {google ? (
        <button onClick={() => setAction(() => disconnectGoogle)}>
          Disconnect Google
        </button>
      ) : (
        <button onClick={() => setAction(() => connectGoogle)}>
          Connect Google
        </button>
      )}
      {action && (
        <StepUpDialog
          onCancel={() => setAction(undefined)}
          onVerified={async () => {
            await action();
            setAction(undefined);
          }}
        />
      )}
    </main>
  );
}
