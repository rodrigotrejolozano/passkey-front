import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/components/auth/public-auth-guard", () => ({
  PublicAuthGuard: ({ children }: { children: ReactNode }) => children,
}));

import HomePage from "./page";

describe("HomePage", () => {
  it("identifies the passwordless product", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Authentication without passwords.",
      }),
    ).toBeInTheDocument();
  });
});
