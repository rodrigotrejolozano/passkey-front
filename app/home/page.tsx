"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiRequest, jsonRequest } from "@/lib/api/client";

type MeResponse = { data: { user: { displayName: string } } };

export default function AuthenticatedHome() {
  const router = useRouter();
  const [name, setName] = useState<string>();

  useEffect(() => {
    apiRequest<MeResponse>("/api/auth/me")
      .then((result) => setName(result.data.user.displayName))
      .catch(() => router.replace("/sign-in"));
  }, [router]);

  async function logout() {
    await jsonRequest("/api/auth/logout", {});
    router.replace("/");
  }

  return (
    <main>
      <p className="eyebrow">PASSWORDLESS</p>
      <h1>{name ? `Welcome, ${name}` : "Loading your security overview..."}</h1>
      <p>Authentication is protected by your Passkey.</p>
      <button onClick={logout}>Logout</button>
    </main>
  );
}
