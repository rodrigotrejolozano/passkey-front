"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api/client";

type ProfileResponse = { data: { displayName: string; createdAt: string } };

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    void apiRequest<ProfileResponse>("/api/security/profile").then((result) =>
      setDisplayName(result.data.displayName),
    );
  }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await apiRequest("/api/security/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    setSaved(true);
  }
  return (
    <main>
      <nav>
        <Link href="/home">Home</Link>{" "}
        <Link href="/security/sign-in">Sign-in methods</Link>{" "}
        <Link href="/security/sessions">Sessions</Link>
      </nav>
      <p className="eyebrow">PROFILE</p>
      <h1>Your profile</h1>
      <form onSubmit={save}>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
            setSaved(false);
          }}
          required
        />
        <button type="submit">Save changes</button>
      </form>
      {saved && <p role="status">Profile updated.</p>}
    </main>
  );
}
