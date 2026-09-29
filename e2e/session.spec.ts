import { expect, test } from "@playwright/test";

const apiOrigin = process.env.PLAYWRIGHT_API_ORIGIN ?? "http://localhost:3001";

test("authenticated home loads and logs out with CSRF", async ({ page }) => {
  let signedOut = false;
  await page.route(`${apiOrigin}/api/auth/me`, async (route) => {
    if (signedOut) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "SESSION_INVALID",
            message: "Authentication is required.",
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: { id: "user-demo", displayName: "Demo User" },
          authMethod: "PASSKEY",
        },
      }),
    });
  });
  await page.route(`${apiOrigin}/api/auth/csrf`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { csrfToken: "test-csrf-value" } }),
    });
  });
  await page.route(`${apiOrigin}/api/auth/logout`, async (route) => {
    expect(route.request().headers()["x-csrf-token"]).toBe("test-csrf-value");
    signedOut = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { loggedOut: true } }),
    });
  });

  await page.goto("/en/home");
  await expect(
    page.getByRole("heading", { name: "Welcome, Demo User" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/en$/);
});

test("authenticated navigation fits the viewport", async ({ page }) => {
  await page.route(`${apiOrigin}/api/auth/me`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: { id: "user-demo", displayName: "Demo User" },
          authMethod: "GOOGLE",
        },
      }),
    });
  });
  await page.goto("/en/home");
  await expect(page.getByRole("navigation")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("expired sessions leave Home and settings for sign-in", async ({
  page,
}) => {
  await page.route(`${apiOrigin}/api/auth/me`, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "SESSION_INVALID",
          message: "Authentication is required.",
        },
      }),
    });
  });

  await page.goto("/home");
  await expect(page).toHaveURL(/\/sign-in\?reason=session-expired$/);
  await expect(
    page.getByText("Your session expired. Sign in again to continue."),
  ).toBeVisible();

  await page.goto("/security/sessions");
  await expect(page).toHaveURL(/\/sign-in\?reason=session-expired$/);
});

test("signed-in users skip public authentication screens", async ({ page }) => {
  await page.route(`${apiOrigin}/api/auth/me`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          user: { id: "user-demo", displayName: "Demo User" },
          authMethod: "PASSKEY",
        },
      }),
    });
  });

  await page.goto("/create-account");
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole("heading", { name: "Welcome, Demo User" }),
  ).toBeVisible();

  await page.goto("/sign-in");
  await expect(page).toHaveURL(/\/home$/);

  await page.goto("/");
  await expect(page).toHaveURL(/\/home$/);
});
