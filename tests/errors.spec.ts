import { expect, test } from "@playwright/test";

test.describe("Error Handling & Custom 404 (FR-34, NFR-26)", () => {
  test("navigating to a non-existent URL triggers custom 404 page with functional links", async ({ page }) => {
    const response = await page.goto("/non-existent-page-xyz-12345");
    // Next.js returns 404 for missing static/dynamic routes
    expect(response?.status()).toBe(404);

    const main = page.getByRole("main");
    await expect(main).toBeVisible();

    const heading = main.getByRole("heading", { level: 1, name: /Page not found/i });
    await expect(heading).toBeVisible();

    const browseLink = main.getByRole("link", { name: "Browse perfumes" });
    await expect(browseLink).toBeVisible();

    const setsLink = main.getByRole("link", { name: "Discovery sets" });
    await expect(setsLink).toBeVisible();

    // Test clicking "Browse perfumes"
    await browseLink.click();
    await expect(page).toHaveURL(/\/shop/);
  });

  test("discovery sets link on 404 page navigates to /sets", async ({ page }) => {
    await page.goto("/another-unknown-route");
    const setsLink = page.getByRole("main").getByRole("link", { name: "Discovery sets" });
    await expect(setsLink).toBeVisible();
    await setsLink.click();
    await expect(page).toHaveURL(/\/sets/);
  });
});
