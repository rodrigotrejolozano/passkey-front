import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { RecoveryCodesReplaceDialog } from "./recovery-codes-replace-dialog";

describe("RecoveryCodesReplaceDialog", () => {
  it("requires an explicit confirmation before replacing codes", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
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
