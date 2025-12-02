import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Note: In a real scenario, you'd implement proper authentication
    // For now, we'll just test navigation to login
    await page.goto("/dashboard");
  });

  test("should redirect to login when not authenticated", async ({ page }) => {
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Dashboard (Authenticated)", () => {
  // This would require setting up proper authentication state
  // For now, we'll skip these tests as they require a valid session

  test.skip("should display dashboard statistics", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByText(/total de produtos/i)).toBeVisible();
    await expect(page.getByText(/orçamentos/i)).toBeVisible();
  });

  test.skip("should navigate to products page", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("link", { name: /produtos/i }).click();

    await expect(page).toHaveURL(/\/produtos/);
  });
});
