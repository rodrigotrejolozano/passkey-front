import type { ReactNode } from "react";
import { AuthCarousel } from "@/components/auth/auth-carousel";

import { AuthScreen } from "@/components/layout/auth-screen";

export function AuthPortal({ children }: { children: ReactNode }) {
  return (
    <AuthScreen>
      <div className="grid min-h-dvh w-full lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(28rem,0.85fr)_minmax(38rem,1.15fr)] lg:overflow-hidden">
        <div className="grid min-w-0 place-items-center px-6 py-12 sm:px-12 lg:overflow-y-auto lg:px-16 xl:px-24">
          <div className="w-full max-w-xl">{children}</div>
        </div>
        <AuthCarousel />
      </div>
    </AuthScreen>
  );
}
