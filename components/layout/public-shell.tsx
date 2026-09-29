import type { ReactNode } from "react";
import { Brand } from "@/components/layout/brand";
import { LanguageSwitch } from "@/components/language-switch";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <LanguageSwitch />
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
        {children}
      </main>
    </div>
  );
}
