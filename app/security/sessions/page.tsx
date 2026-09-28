"use client";

import { useEffect, useState } from "react";

import { AuthNavigation } from "@/components/auth-navigation";
import {
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
    await protectedJsonRequest("/api/sessions/revoke-others", {});
    await load();
  }
  async function revoke(id: string) {
    await protectedRequest(`/api/sessions/${id}`, { method: "DELETE" });
    await load();
  }
  return (
    <main>
      <AuthNavigation />
      <p className="eyebrow">ACTIVE SESSIONS</p>
      <h1>Your devices</h1>
      {data?.sessions.map((session) => (
        <p key={session.id}>
          {session.id === data.currentSessionId
            ? "Current session"
            : (session.userAgent ?? "Unknown device")}{" "}
          · Last active {new Date(session.lastSeenAt).toLocaleString()}
          {session.id !== data.currentSessionId && (
            <button onClick={() => revoke(session.id)}>Revoke</button>
          )}
        </p>
      ))}
      <button onClick={revokeOthers}>Revoke all other sessions</button>
    </main>
  );
}
