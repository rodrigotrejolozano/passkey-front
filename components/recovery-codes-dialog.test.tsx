import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { RecoveryCodesDialog } from "./recovery-codes-dialog";

describe("RecoveryCodesDialog", () => {
  it("focuses a safe action and does not discard codes with Escape", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <RecoveryCodesDialog codes={["LOOKUP.SECRET"]} onConfirm={onConfirm} />,
    );

    expect(screen.getByRole("button", { name: "Copy codes" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByText("LOOKUP.SECRET")).toBeInTheDocument();
  });

  it("contains keyboard focus within the dialog", async () => {
    const user = userEvent.setup();
    render(
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
    render(
      <RecoveryCodesDialog codes={["LOOKUP.SECRET"]} onConfirm={onConfirm} />,
    );
    await user.click(screen.getByRole("button", { name: "I saved my codes" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
