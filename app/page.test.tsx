import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { vi } from "vitest";

import messages from "@/messages/en.json";

vi.mock("@/components/auth/public-auth-guard", () => ({
  PublicAuthGuard: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  usePathname: () => "/",
}));

import HomePage from "./page";

describe("HomePage", () => {
  it("identifies the passwordless product", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <HomePage />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Authentication without passwords.",
      }),
    ).toBeInTheDocument();
  });
});
