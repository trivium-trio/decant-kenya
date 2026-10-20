import { expect, test } from "@playwright/test";

test.describe("Instant search suggestions (FR-14)", () => {
  test("typing >= 2 characters shows instant suggestions with product links and KES prices", async ({
    page,
  }) => {
    await page.goto("/shop");
    const searchInput = page.locator("#search");
    await searchInput.fill("Perfume");

    const listbox = page.locator("#search-suggestions-listbox");
    await expect(listbox).toBeVisible({ timeout: 5000 });

    const options = listbox.locator("[role='option']");
    await expect(options).toHaveCount(5);

    // Verify option content
    const firstOption = options.first();
    await expect(firstOption).toContainText("Ksh");
    await expect(firstOption).toHaveAttribute("href", /^\/product\//);
  });

  test("pressing Escape closes the suggestions listbox", async ({ page }) => {
    await page.goto("/shop");
    const searchInput = page.locator("#search");
    await searchInput.fill("Perfume");

    const listbox = page.locator("#search-suggestions-listbox");
    await expect(listbox).toBeVisible({ timeout: 5000 });

    await searchInput.press("Escape");
    await expect(listbox).not.toBeVisible();
  });

  test("clicking a suggestion navigates to the product detail page", async ({ page }) => {
    await page.goto("/shop");
    const searchInput = page.locator("#search");
    await searchInput.fill("Perfume 14");

    const listbox = page.locator("#search-suggestions-listbox");
    await expect(listbox).toBeVisible({ timeout: 5000 });

    const suggestion = listbox.locator("[role='option']").first();
    await suggestion.click();

    await expect(page).toHaveURL(/\/product\/sample-perfume-14$/);
    await expect(page.getByRole("heading", { name: "[Perfume 14]" })).toBeVisible();
  });
});
