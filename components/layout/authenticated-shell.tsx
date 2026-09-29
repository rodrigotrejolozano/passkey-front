"use client";

import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { AuthNavigation } from "@/components/auth-navigation";
import { SessionBoundary } from "@/components/auth/session-boundary";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { protectedJsonRequest } from "@/lib/api/client";

export function AuthenticatedShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function logout() {
    await protectedJsonRequest("/api/auth/logout", {});
    router.replace("/");
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Brand href="/home" />
          <div className="flex items-center gap-2">
            <AuthNavigation />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void logout()}
              className="shrink-0"
            >
              <LogOut className="size-4 text-danger-600" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <SessionBoundary>{children}</SessionBoundary>
      </main>
    </div>
  );
}
