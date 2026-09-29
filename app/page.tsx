import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PublicAuthGuard } from "@/components/auth/public-auth-guard";
import { AuthPortal } from "@/components/layout/auth-portal";

export default function HomePage() {
  return (
    <PublicAuthGuard>
      <AuthPortal>
        <section className="grid w-full gap-7">
          <div className="grid gap-3">
            <p className="text-xs font-bold tracking-[0.16em] text-brand-700">
              PASSWORDLESS ACCESS
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Authentication without passwords.
            </h1>
            <p className="leading-7 text-muted">
              Use the secure sign-in methods already available on your device.
            </p>
          </div>
          <nav
            aria-label="Authentication actions"
            className="grid gap-3 sm:grid-cols-2"
          >
            <Link
              href="/create-account"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              Create account
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-mint hover:bg-white"
            >
              Sign in
            </Link>
          </nav>
        </section>
      </AuthPortal>
    </PublicAuthGuard>
  );
}
