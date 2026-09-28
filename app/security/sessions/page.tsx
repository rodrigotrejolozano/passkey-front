"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiRequest, jsonRequest } from "@/lib/api/client";

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

export default function SessionsPage() {
  const [data, setData] = useState<SessionsResponse["data"]>();
  const load = () =>
    apiRequest<SessionsResponse>("/api/sessions").then((result) =>
      setData(result.data),
    );
  useEffect(() => {
    void load();
  }, []);
  async function revokeOthers() {
    await jsonRequest("/api/sessions/revoke-others", {});
    await load();
  }
  return (
    <main>
      <nav>
        <Link href="/home">Home</Link>{" "}
        <Link href="/security/sign-in">Sign-in methods</Link>
      </nav>
      <p className="eyebrow">ACTIVE SESSIONS</p>
      <h1>Your devices</h1>
      {data?.sessions.map((session) => (
        <p key={session.id}>
          {session.id === data.currentSessionId
            ? "Current session"
            : (session.userAgent ?? "Unknown device")}{" "}
          · Last active {new Date(session.lastSeenAt).toLocaleString()}
        </p>
      ))}
      <button onClick={revokeOthers}>Revoke all other sessions</button>
    </main>
  );
}
