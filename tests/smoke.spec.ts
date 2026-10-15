import { expect, test } from "@playwright/test";

test("landing page renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("landing page has no horizontal scroll (NFR-9)", async ({ page }) => {
  await page.goto("/");
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflows).toBe(false);
});
