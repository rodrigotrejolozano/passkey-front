import { expect, test } from "@playwright/test";

const apiOrigin = process.env.PLAYWRIGHT_API_ORIGIN ?? "http://localhost:3001";

test("English public navigation exposes passwordless entry points", async ({
  page,
}) => {
  await page.goto("/en");
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
  await page.goto("/es/sign-in");
  await expect(
    page.getByRole("heading", { name: "Inicia sesión sin contraseña." }),
  ).toBeVisible();
  const hasVerticalOverflow = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  );
  expect(hasVerticalOverflow).toBe(false);
});

test("recovery chooser reaches email and code methods", async ({ page }) => {
  await page.goto("/es/recovery");
  await expect(
    page.getByRole("heading", { name: "Elige un método de recuperación" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Usar correo de recuperación" }).click();
  await expect(page).toHaveURL(/\/es\/recovery\/email$/);
  await expect(page.getByLabel("Método de entrega")).toBeVisible();
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
  await page.goto("/es/recovery/email");
  await page.getByLabel("Correo de recuperación").fill("unknown@example.test");
  await page.getByLabel("Método de entrega").selectOption("MAGIC_LINK");
  await page
    .getByRole("button", { name: "Enviar instrucciones de recuperación" })
    .click();
  await expect(
    page.getByText(/Si existe una cuenta elegible, se envió un enlace seguro/),
  ).toBeVisible();
  await expect(page.getByText("unknown@example.test")).toBeVisible();
});

test("callback results use fixed safe destinations", async ({ page }) => {
  await page.goto("/es/auth/result?status=success&flow=account-recovery");
  await expect(page.getByRole("link", { name: "Continuar" })).toHaveAttribute(
    "href",
    "/es/restore-access",
  );

  await page.goto("/es/auth/result?status=error&flow=recovery");
  await expect(
    page.getByRole("link", { name: "Intentarlo de nuevo" }),
  ).toHaveAttribute("href", "/es/restore-access");

  await page.goto(
    "/es/auth/result?status=error&flow=link&reason=google-already-linked",
  );
  await expect(
    page.getByRole("heading", {
      name: "Esta cuenta de Google ya está vinculada a otro usuario.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Intentarlo de nuevo" }),
  ).toHaveAttribute("href", "/es/security/sign-in");

  await page.goto(
    "/es/auth/result?status=error&flow=step-up&source=recovery&reason=google-account-mismatch",
  );
  await expect(
    page.getByRole("heading", {
      name: "Usa la cuenta de Google vinculada a este usuario.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Intentarlo de nuevo" }),
  ).toHaveAttribute("href", "/es/security/recovery?stepUp=failed");

  await page.goto(
    "/es/auth/result?status=success&flow=step-up&source=recovery",
  );
  await expect(page.getByRole("link", { name: "Continuar" })).toHaveAttribute(
    "href",
    "/es/security/recovery?stepUp=complete",
  );
});
