import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Passwordless",
  description: "Authentication without passwords.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
