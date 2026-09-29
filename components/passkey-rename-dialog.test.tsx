import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import messages from "@/messages/en.json";
import { PasskeyRenameDialog } from "./passkey-rename-dialog";

function renderDialog(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("PasskeyRenameDialog", () => {
  it("focuses the name and saves an explicit replacement", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn(async () => undefined);
    const onCancel = vi.fn();
    renderDialog(
      <PasskeyRenameDialog
        passkey={{ id: "passkey-1", name: "Work laptop" }}
        onCancel={onCancel}
        onSave={onSave}
      />,
    );

    const input = screen.getByLabelText("Passkey name");
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, "Personal phone");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(onSave).toHaveBeenCalledWith("passkey-1", "Personal phone");
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
