import type { ReactNode } from "react";

import { LanguageSwitch } from "@/components/language-switch";

export function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-dvh bg-white">
      <div className="absolute right-5 top-5 z-10 sm:right-8 sm:top-8">
        <LanguageSwitch />
      </div>
      {children}
    </main>
  );
}
