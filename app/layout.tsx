import type { Metadata } from "next";
import { headers } from "next/headers";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Passwordless",
    template: "%s | Passwordless",
  },
  description: "Authentication without passwords.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-next-intl-locale") ?? "es";
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
