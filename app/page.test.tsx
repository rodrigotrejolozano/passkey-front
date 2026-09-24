import { render, screen } from "@testing-library/react";

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
