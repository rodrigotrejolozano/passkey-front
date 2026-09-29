import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/components/layout/authenticated-shell";
import { SettingsNavigation } from "@/components/settings-navigation";

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedShell>
      <div className="grid gap-8">
        <section className="grid gap-1">
          <p className="text-xs font-bold tracking-[0.16em] text-brand-700">
            SETTINGS
          </p>
          <p className="text-sm leading-6 text-muted">
            Manage your account security and access.
          </p>
        </section>
        <SettingsNavigation />
        {children}
      </div>
    </AuthenticatedShell>
  );
}
