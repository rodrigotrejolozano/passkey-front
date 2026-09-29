import Link from "next/link";
import { ChevronRight, Mail, ShieldCheck, Ticket } from "lucide-react";

import { AuthPortal } from "@/components/layout/auth-portal";
import { Card } from "@/components/ui/card";

export default function RecoveryPage() {
  return (
    <AuthPortal>
      <div className="w-full">
        <div className="text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-bold tracking-[0.16em] text-brand-700">
            ACCOUNT RECOVERY
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
            Choose a recovery method
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
            Recovery verifies your identity first. You will restore a sign-in
            method before receiving normal account access.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <RecoveryOption
            href="/recovery/email"
            icon={Mail}
            title="Use recovery email"
            description="Receive a verification code or secure sign-in link."
          />
          <RecoveryOption
            href="/recovery/code"
            icon={Ticket}
            title="Use a recovery code"
            description="Enter one of the recovery codes saved for your account."
          />
        </div>
        <Link
          href="/sign-in"
          className="mx-auto mt-7 block w-fit text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Back to sign in
        </Link>
      </div>
    </AuthPortal>
  );
}

function RecoveryOption({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Mail;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full p-5 transition-colors hover:border-brand-300 hover:bg-brand-50 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <ChevronRight
            className="mt-2 size-4 text-muted transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </div>
        <h2 className="mt-5 font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </Card>
    </Link>
  );
}
