"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiRequest } from "@/lib/api/client";

type PasskeyResponse = {
  data: { passkeys: Array<{ id: string; name: string; createdAt: string }> };
};
type GoogleResponse = {
  data: { identity: { providerEmail: string | null } | null };
};

export default function SignInMethodsPage() {
  const [passkeys, setPasskeys] = useState<PasskeyResponse["data"]["passkeys"]>(
    [],
  );
  const [google, setGoogle] =
    useState<GoogleResponse["data"]["identity"]>(null);
  useEffect(() => {
    void Promise.all([
      apiRequest<PasskeyResponse>("/api/security/passkeys"),
      apiRequest<GoogleResponse>("/api/security/google"),
    ]).then(([keys, identity]) => {
      setPasskeys(keys.data.passkeys);
      setGoogle(identity.data.identity);
    });
  }, []);
  return (
    <main>
      <nav>
        <Link href="/home">Home</Link>{" "}
        <Link href="/security/sessions">Sessions</Link>
      </nav>
      <p className="eyebrow">SIGN-IN METHODS</p>
      <h1>Passkeys</h1>
      {passkeys.map((passkey) => (
        <p key={passkey.id}>
          {passkey.name} · Created{" "}
          {new Date(passkey.createdAt).toLocaleDateString()}
        </p>
      ))}
      <h2>Google</h2>
      <p>{google?.providerEmail ?? "Not connected"}</p>
      <p>Adding, removing, and linking methods require step-up verification.</p>
    </main>
  );
}
