import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import messages from "@/messages/en.json";
import { RecoveryCodesReplaceDialog } from "./recovery-codes-replace-dialog";

function renderDialog(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("RecoveryCodesReplaceDialog", () => {
  it("requires an explicit confirmation before replacing codes", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    renderDialog(
      <RecoveryCodesReplaceDialog onCancel={onCancel} onConfirm={onConfirm} />,
    );

    expect(
      screen.getByRole("button", { name: "Keep current codes" }),
    ).toHaveFocus();
    expect(
      screen.getByText(
        /will immediately invalidate every unused recovery code/,
      ),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Generate new codes" }),
    );
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
