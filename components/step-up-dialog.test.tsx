import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { StepUpDialog } from "./step-up-dialog";

describe("StepUpDialog", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("offers only methods linked to the current account", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ data: { passkey: false, google: true } }),
      ),
    );

    render(<StepUpDialog onVerified={vi.fn()} onCancel={vi.fn()} />);

    expect(
      await screen.findByRole("button", { name: "Verify with Google" }),
    ).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Verify with Passkey" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Verify with your linked Google account to continue."),
    ).toBeInTheDocument();
  });
});
