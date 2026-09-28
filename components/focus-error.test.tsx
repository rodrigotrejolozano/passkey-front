import { render, screen } from "@testing-library/react";

import { FocusError } from "./focus-error";

describe("FocusError", () => {
  it("moves focus to a newly rendered error", () => {
    const { rerender } = render(<FocusError />);
    rerender(<FocusError message="The request failed." />);

    expect(screen.getByRole("alert")).toHaveFocus();
  });
});
