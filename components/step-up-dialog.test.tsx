import { render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { vi } from "vitest";

import messages from "@/messages/en.json";
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

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <StepUpDialog onVerified={vi.fn()} onCancel={vi.fn()} />
      </NextIntlClientProvider>,
    );

    const googleButton = await screen.findByRole("button", {
      name: "Verify with Google",
    });
    await waitFor(() => expect(googleButton).toHaveFocus());
    expect(
      screen.queryByRole("button", { name: "Verify with Passkey" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Verify with your linked Google account to continue."),
    ).toBeInTheDocument();
  });
});
