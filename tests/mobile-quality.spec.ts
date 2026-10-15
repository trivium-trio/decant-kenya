import { expect, test } from "@playwright/test";

const mobileViewports = [
  { width: 360, height: 740, name: "360x740" },
  { width: 390, height: 844, name: "390x844" },
];

for (const vp of mobileViewports) {
  test.describe(`Mobile quality checks (${vp.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
    });

    test("has no horizontal overflow (NFR-9)", async ({ page }) => {
      await page.goto("/");
      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflows).toBe(false);
    });

    test("every visible link and button has a bounding box at least 44px tall (NFR-10)", async ({ page }) => {
      await page.goto("/");
      const elements = await page.locator("a, button").all();
      for (const el of elements) {
        if (await el.isVisible()) {
          const isDevTool = await el.evaluate(
            (node) =>
              !!node.closest("nextjs-portal") ||
              !!node.closest("[data-nextjs-dev-tools-button]") ||
              node.getAttribute("data-nextjs-dev-tools-button") !== null ||
              (node.getAttribute("aria-label")?.includes("Next.js") ?? false),
          );
          if (isDevTool) continue;

          const box = await el.boundingBox();
          if (box) {
            // Check bounding box height >= 44px (allowing 0.1px tolerance for subpixel scaling)
            const tagName = await el.evaluate((node) => node.tagName.toLowerCase());
            const text = (await el.innerText()).trim() || (await el.getAttribute("aria-label")) || "";
            expect(
              box.height,
              `Element <${tagName}> with text "${text}" should be at least 44px tall (was ${box.height}px)`,
            ).toBeGreaterThanOrEqual(43.9);
          }
        }
      }
    });

    test("the Menu button opens the sheet, a nav link is reachable and navigates, and the sheet closes (FR-1, FR-3)", async ({ page }) => {
      await page.goto("/");
      const menuButton = page.getByRole("button", { name: /menu/i });
      await expect(menuButton).toBeVisible();

      // Open sheet
      await menuButton.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading", { name: "Menu" })).toBeVisible();

      // Click a nav link
      const shopLink = dialog.getByRole("link", { name: "Shop" });
      await expect(shopLink).toBeVisible();
      await shopLink.click();

      // Navigated to /shop and dialog closed
      await expect(page).toHaveURL(/\/shop/);
      await expect(dialog).not.toBeVisible();
    });

    test("clicking Add to cart on a best seller makes the header show Cart (1) (FR-8)", async ({ page }) => {
      await page.goto("/");
      const cartLink = page.getByRole("link", { name: /cart \(0\)/i });
      await expect(cartLink).toBeVisible();

      const addToCartButtons = page.getByRole("button", { name: "Add to cart" });
      await expect(addToCartButtons.first()).toBeVisible();
      await addToCartButtons.first().click();

      // Header updates to Cart (1)
      await expect(page.getByRole("link", { name: /cart \(1\)/i })).toBeVisible();

      // Sonner toast appears
      await expect(page.getByText("Added to cart")).toBeVisible();
    });
  });
}
