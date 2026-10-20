import { expect, test } from "@playwright/test";

test.describe("Kenya DPA consent banner and preferences (NFR-25, NFR-31, FR-36)", () => {
  test("consent banner appears on first visit and persists choice across reloads", async ({
    page,
  }) => {
    // Clear localStorage to simulate fresh visit
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const banner = page.locator("aside[aria-label='Privacy and cookies']");
    await expect(banner).toBeVisible({ timeout: 5000 });

    const acceptBtn = banner.getByRole("button", { name: "Accept analytics" });
    await expect(acceptBtn).toBeVisible();
    await acceptBtn.click();

    await expect(banner).not.toBeVisible();

    // Reload page; banner should remain hidden
    await page.reload();
    await expect(banner).not.toBeVisible();
  });

  test("choosing 'Essential only' also hides banner and persists", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const banner = page.locator("aside[aria-label='Privacy and cookies']");
    await expect(banner).toBeVisible({ timeout: 5000 });

    const essentialBtn = banner.getByRole("button", { name: "Essential only" });
    await expect(essentialBtn).toBeVisible();
    await essentialBtn.click();

    await expect(banner).not.toBeVisible();

    await page.reload();
    await expect(banner).not.toBeVisible();
  });

  test("user can reopen/withdraw consent from the footer trigger", async ({ page }) => {
    await page.goto("/");
    // Set consent choice first
    const banner = page.locator("aside[aria-label='Privacy and cookies']");
    await expect(banner).toBeVisible({ timeout: 5000 });
    await banner.getByRole("button", { name: "Accept analytics" }).click();
    await expect(banner).not.toBeVisible();

    // Reopen from footer trigger
    const manageBtn = page.getByRole("button", { name: "Manage cookie preferences" }).first();
    await expect(manageBtn).toBeVisible();
    await manageBtn.click();

    // Banner should reappear
    await expect(banner).toBeVisible();
  });

  test("user can reopen/withdraw consent from the /privacy page", async ({ page }) => {
    await page.goto("/privacy");
    const banner = page.locator("aside[aria-label='Privacy and cookies']");
    await expect(banner).toBeVisible({ timeout: 5000 });
    await banner.getByRole("button", { name: "Essential only" }).click();
    await expect(banner).not.toBeVisible();

    // Click manage cookie preferences on privacy page
    const privacyManageBtn = page.locator("main").getByRole("button", { name: "Manage cookie preferences" });
    await expect(privacyManageBtn).toBeVisible();
    await privacyManageBtn.click();

    await expect(banner).toBeVisible();
  });
});
