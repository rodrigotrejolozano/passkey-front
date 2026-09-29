import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import messages from "@/messages/en.json";
import { RecoveryCodesDialog } from "./recovery-codes-dialog";

function renderDialog(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("RecoveryCodesDialog", () => {
  it("focuses a safe action and does not discard codes with Escape", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog(
      <RecoveryCodesDialog codes={["LOOKUP.SECRET"]} onConfirm={onConfirm} />,
    );

    expect(screen.getByRole("button", { name: "Copy codes" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText("LOOKUP.SECRET")).toBeInTheDocument();
  });

  it("contains keyboard focus within the dialog", async () => {
    const user = userEvent.setup();
    renderDialog(
      <RecoveryCodesDialog codes={["LOOKUP.SECRET"]} onConfirm={vi.fn()} />,
    );

    await user.tab({ shift: true });
    expect(
      screen.getByRole("button", { name: "I saved my codes" }),
    ).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Copy codes" })).toHaveFocus();
  });

  it("clears codes only after explicit confirmation", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderDialog(
      <RecoveryCodesDialog codes={["LOOKUP.SECRET"]} onConfirm={onConfirm} />,
    );
    await user.click(screen.getByRole("button", { name: "I saved my codes" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
