import { expect, test } from "@playwright/test";

test("authenticated home loads and logs out with CSRF", async ({ page }) => {
  await page.route("http://localhost:3001/api/auth/me", async (route) => {
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
  await page.route("http://localhost:3001/api/auth/csrf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { csrfToken: "test-csrf-value" } }),
    });
  });
  await page.route("http://localhost:3001/api/auth/logout", async (route) => {
    expect(route.request().headers()["x-csrf-token"]).toBe("test-csrf-value");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { loggedOut: true } }),
    });
  });

  await page.goto("/home");
  await expect(
    page.getByRole("heading", { name: "Welcome, Demo User" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("authenticated navigation fits the viewport", async ({ page }) => {
  await page.route("http://localhost:3001/api/auth/me", async (route) => {
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
  await page.goto("/home");
  await expect(page.getByRole("navigation")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
