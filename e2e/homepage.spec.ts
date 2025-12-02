import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Prezzo/);
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");

    // Check for main navigation elements
    await expect(page.getByRole("link", { name: /entrar/i })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /entrar/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });
});
