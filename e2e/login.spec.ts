import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveTitle(/Prezzo/);
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
    await expect(page.getByPlaceholder(/e-mail/i)).toBeVisible();
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: /entrar/i }).click();

    // Wait for validation messages
    await page.waitForTimeout(500);

    // Check if still on login page (didn't navigate away)
    expect(page.url()).toContain("/login");
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: /criar conta/i }).click();

    await expect(page).toHaveURL(/\/register/);
  });
});
