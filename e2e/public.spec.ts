import { expect, test } from "@playwright/test";

const apiOrigin = process.env.PLAYWRIGHT_API_ORIGIN ?? "http://localhost:3001";

test("public navigation exposes passwordless entry points", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Authentication without passwords." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Create account" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test("desktop access portal fits within the viewport", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Desktop-only layout check");
  await page.goto("/sign-in");
  await expect(
    page.getByRole("heading", { name: "Sign in without a password." }),
  ).toBeVisible();
  const hasVerticalOverflow = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  );
  expect(hasVerticalOverflow).toBe(false);
});

test("recovery chooser reaches email and code methods", async ({ page }) => {
  await page.goto("/recovery");
  await expect(
    page.getByRole("heading", { name: "Choose a recovery method" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Use recovery email" }).click();
  await expect(page).toHaveURL(/\/recovery\/email$/);
  await expect(page.getByLabel("Delivery method")).toBeVisible();
});

test("public email request remains neutral for Magic Link", async ({
  page,
}) => {
  await page.route(`${apiOrigin}/api/recovery/request`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { accepted: true } }),
    });
  });
  await page.goto("/recovery/email");
  await page.getByLabel("Recovery email").fill("unknown@example.test");
  await page.getByLabel("Delivery method").selectOption("MAGIC_LINK");
  await page
    .getByRole("button", { name: "Send recovery instructions" })
    .click();
  await expect(
    page.getByText(/If an eligible account exists, a secure link was sent/),
  ).toBeVisible();
  await expect(page.getByText("unknown@example.test")).toBeVisible();
});

test("callback results use fixed safe destinations", async ({ page }) => {
  await page.goto("/auth/result?status=success&flow=account-recovery");
  await expect(page.getByRole("link", { name: "Continue" })).toHaveAttribute(
    "href",
    "/restore-access",
  );

  await page.goto("/auth/result?status=error&flow=recovery");
  await expect(page.getByRole("link", { name: "Try again" })).toHaveAttribute(
    "href",
    "/restore-access",
  );

  await page.goto(
    "/auth/result?status=error&flow=link&reason=google-already-linked",
  );
  await expect(
    page.getByRole("heading", {
      name: "This Google account is already linked to another user.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Try again" })).toHaveAttribute(
    "href",
    "/security/sign-in",
  );

  await page.goto(
    "/auth/result?status=error&flow=step-up&source=recovery&reason=google-account-mismatch",
  );
  await expect(
    page.getByRole("heading", {
      name: "Use the Google account linked to this user.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Try again" })).toHaveAttribute(
    "href",
    "/security/recovery?stepUp=failed",
  );

  await page.goto("/auth/result?status=success&flow=step-up&source=recovery");
  await expect(page.getByRole("link", { name: "Continue" })).toHaveAttribute(
    "href",
    "/security/recovery?stepUp=complete",
  );
});
