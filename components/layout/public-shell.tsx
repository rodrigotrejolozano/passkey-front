import type { ReactNode } from "react";
import Link from "next/link";

import { Brand } from "@/components/layout/brand";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <Link
          href="/sign-in"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-white hover:text-ink"
        >
          Account access
        </Link>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
        {children}
      </main>
    </div>
  );
}
