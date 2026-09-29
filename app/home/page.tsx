"use client";

import { KeyRound, RotateCcwKey, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthenticatedShell } from "@/components/layout/authenticated-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiRequest } from "@/lib/api/client";

type MeResponse = {
  data: { user: { displayName: string }; authMethod: "PASSKEY" | "GOOGLE" };
};

const destinations = [
  {
    href: "/security/sign-in",
    title: "Sign-in methods",
    description: "Manage Passkeys and your Google connection.",
    icon: KeyRound,
  },
  {
    href: "/security/sessions",
    title: "Sessions",
    description: "Review devices with access to your account.",
    icon: ShieldCheck,
  },
  {
    href: "/security/recovery",
    title: "Recovery",
    description: "Keep recovery options ready when you need them.",
    icon: RotateCcwKey,
  },
];

export default function AuthenticatedHome() {
  const router = useRouter();
  const [name, setName] = useState<string>();
  const [authMethod, setAuthMethod] = useState<"PASSKEY" | "GOOGLE">();

  useEffect(() => {
    apiRequest<MeResponse>("/api/auth/me")
      .then((result) => {
        setName(result.data.user.displayName);
        setAuthMethod(result.data.authMethod);
      })
      .catch((cause) =>
        router.replace(
          cause instanceof ApiError && cause.code === "SESSION_INVALID"
            ? "/sign-in?reason=session-expired"
            : "/sign-in",
        ),
      );
  }, [router]);

  return (
    <AuthenticatedShell>
      <article className="grid gap-8">
        <section className="grid gap-4 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <p className="eyebrow">PASSWORDLESS, EXPLAINED</p>
          {name ? (
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {`Welcome, ${name}. Your account is built without a password.`}
            </h1>
          ) : (
            <Skeleton className="h-10 w-72" />
          )}
          {authMethod ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge>
                {authMethod === "GOOGLE" ? "Google" : "Passkey"} sign-in
              </Badge>
              <p className="text-sm leading-6 text-muted">
                {authMethod === "GOOGLE"
                  ? "Google verified your identity for this session."
                  : "Your Passkey protects this session."}
              </p>
            </div>
          ) : (
            <Skeleton className="h-6 w-64" />
          )}
        </section>

        <section className="grid gap-5 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Why passkeys are different
            </h2>
            <p className="leading-7 text-muted">
              A passkey replaces a shared password with a private credential on
              your device. You approve the sign-in with a fingerprint, face
              recognition, or screen lock, then your device creates a unique
              proof that only works for this application.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50 p-5">
              <h3 className="font-bold text-brand-900">No secret to reuse</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                There is no password to leak, memorize, or accidentally reuse on
                another website.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-5">
              <h3 className="font-bold text-brand-900">
                Designed for the real site
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                The proof is bound to this domain, helping protect you from
                phishing pages that imitate a sign-in form.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              How this authentication works
            </h2>
            <p className="leading-7 text-muted">
              This service verifies your identity with a passkey or a connected
              Google account, then creates a protected session for your device.
              Sensitive account changes ask for an additional identity check.
            </p>
          </div>
          <ol className="grid gap-3 text-sm leading-6 text-muted sm:grid-cols-3">
            <li className="rounded-2xl border border-line p-4">
              <strong className="block text-ink">1. Verify</strong>Approve with
              your trusted device or Google.
            </li>
            <li className="rounded-2xl border border-line p-4">
              <strong className="block text-ink">2. Protect</strong>Your session
              is secured and can be reviewed at any time.
            </li>
            <li className="rounded-2xl border border-line p-4">
              <strong className="block text-ink">3. Recover</strong>Recovery
              email and codes help you return safely.
            </li>
          </ol>
        </section>

        <section className="grid gap-5 rounded-xl bg-white p-7 shadow-sm sm:p-10">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              An open direction for sign-in
            </h2>
            <p className="leading-7 text-muted">
              Passkeys are based on WebAuthn, a web standard from the W3C, and
              work with the FIDO Alliance approach to passwordless
              authentication. Browser and device platforms are adopting these
              standards so people can use one familiar approval instead of
              creating another password.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line p-5">
              <h3 className="font-bold text-ink">More practical security</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Strong security becomes easier when the sign-in prompt is built
                into the device people already use.
              </p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <h3 className="font-bold text-ink">Less account friction</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Fewer reset flows and no password rotation help people return to
                their accounts with confidence.
              </p>
            </div>
            <div className="rounded-xl border border-line p-5">
              <h3 className="font-bold text-ink">Control stays visible</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                This account keeps sessions, connected Google access, and
                recovery methods in one place for review.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Account settings"
          className="grid gap-4 sm:grid-cols-2"
        >
          {destinations.map(({ href, title, description, icon: Icon }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full group-hover:border-brand-300 group-hover:bg-brand-50/40">
                <div className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-800">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="grid gap-1">
                    <h2 className="font-bold text-ink">{title}</h2>
                    <p className="text-sm leading-6 text-muted">
                      {description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      </article>
    </AuthenticatedShell>
  );
}
