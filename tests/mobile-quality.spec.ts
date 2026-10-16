import { expect, test, type Page } from "@playwright/test";

const mobileViewports = [
  { width: 360, height: 740, name: "360x740" },
  { width: 390, height: 844, name: "390x844" },
];

async function checkNoOverflow(page: Page) {
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflows).toBe(false);
}

async function checkTouchTargets(page: Page) {
  const elements = await page.locator("a, button, label:has(input[type='checkbox'])").all();
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
        const tagName = await el.evaluate((node) => node.tagName.toLowerCase());
        const text = (await el.innerText()).trim() || (await el.getAttribute("aria-label")) || "";
        expect(
          box.height,
          `Element <${tagName}> with text "${text}" should be at least 44px tall (was ${box.height}px)`,
        ).toBeGreaterThanOrEqual(43.9);
      }
    }
  }
}

for (const vp of mobileViewports) {
  test.describe(`Mobile quality checks (${vp.name})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(() => {
        window.localStorage.clear();
      });
    });

    test("landing page has no horizontal overflow (NFR-9)", async ({ page }) => {
      await page.goto("/");
      await checkNoOverflow(page);
    });

    test("landing page every visible link and button is at least 44px tall (NFR-10)", async ({ page }) => {
      await page.goto("/");
      await checkTouchTargets(page);
    });

    test("the Menu button opens the sheet, a nav link is reachable and navigates, and the sheet closes (FR-1, FR-3)", async ({ page }) => {
      await page.goto("/");
      const menuButton = page.getByRole("button", { name: /menu/i });
      await expect(menuButton).toBeVisible();

      await menuButton.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("heading", { name: "Menu" })).toBeVisible();

      const shopLink = dialog.getByRole("link", { name: "Shop" });
      await expect(shopLink).toBeVisible();
      await shopLink.click();

      await expect(page).toHaveURL(/\/shop/);
      await expect(dialog).not.toBeVisible();
    });

    test("clicking Add to cart on a best seller makes the header show Cart (1) (FR-8)", async ({ page }) => {
      await page.goto("/");
      const cartLink = page.getByRole("link", { name: /cart.*0/i });
      await expect(cartLink).toBeVisible();

      const addToCartButtons = page.getByRole("button", { name: "Add to cart" });
      await expect(addToCartButtons.first()).toBeVisible();
      await addToCartButtons.first().click();

      const updatedCartLink = page.getByRole("link", { name: /cart.*1/i });
      await expect(updatedCartLink).toBeVisible();
      await expect(updatedCartLink).toContainText("Cart (1)");

      await expect(page.getByText("Added to cart")).toBeVisible();
    });

    test("/sets has no overflow and meets 44px target rule", async ({ page }) => {
      await page.goto("/sets");
      await checkNoOverflow(page);
      await checkTouchTargets(page);
    });

    test("/sets/sample-set-1 has no overflow and meets 44px target rule", async ({ page }) => {
      await page.goto("/sets/sample-set-1");
      await checkNoOverflow(page);
      await checkTouchTargets(page);
    });

    test("/cart with one item has no overflow, 44px targets, and fixed summary does not cover content", async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "decant-cart",
          JSON.stringify({
            state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
            version: 1,
          }),
        );
      });

      await page.goto("/cart");
      await checkNoOverflow(page);
      await checkTouchTargets(page);

      // Verify the fixed bottom bar does not obscure the last item
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const lastItem = page.locator("section[aria-label='Cart items'] > div").last();
      const summaryBar = page.locator("section[aria-label='Order summary']");
      await expect(lastItem).toBeVisible();
      await expect(summaryBar).toBeVisible();

      const itemBox = await lastItem.boundingBox();
      const summaryBox = await summaryBar.boundingBox();

      if (itemBox && summaryBox) {
        expect(
          itemBox.y + itemBox.height,
          `Cart item bottom (${itemBox.y + itemBox.height}) should be above or equal to summary top (${summaryBox.y})`,
        ).toBeLessThanOrEqual(summaryBox.y + 1);
      }

      // Verify Checkout button is inside the viewport and fully clickable
      const checkoutBtn = summaryBar.getByRole("link", { name: /checkout/i });
      await expect(checkoutBtn).toBeVisible();
      const btnBox = await checkoutBtn.boundingBox();
      expect(btnBox).not.toBeNull();
      if (btnBox) {
        expect(btnBox.y + btnBox.height).toBeLessThanOrEqual(vp.height + 1);
      }
    });

    test("/shop has no overflow and meets 44px target rule", async ({ page }) => {
      await page.goto("/shop");
      await checkNoOverflow(page);
      await checkTouchTargets(page);
    });

    test("/shop?page=2 has no overflow and meets 44px target rule", async ({ page }) => {
      await page.goto("/shop?page=2");
      await checkNoOverflow(page);
      await checkTouchTargets(page);
    });

    test("/shop?q=Perfume has no overflow and meets 44px target rule", async ({ page }) => {
      await page.goto("/shop?q=Perfume");
      await checkNoOverflow(page);
      await checkTouchTargets(page);
    });

    test("/shop?brand=%5BBrand+A%5D&inStock=1 has no overflow and meets 44px target rule", async ({ page }) => {
      await page.goto("/shop?brand=%5BBrand+A%5D&inStock=1");
      await checkNoOverflow(page);
      await checkTouchTargets(page);
    });

    test("open filter sheet has no overflow and meets 44px target rule", async ({ page }) => {
      await page.goto("/shop");
      const filterBtn = page.getByRole("button", { name: /^Filters/ });
      await expect(filterBtn).toBeVisible();
      await filterBtn.click();
      const sheet = page.locator("[data-slot='sheet-content']");
      await expect(sheet).toBeVisible();
      await checkNoOverflow(page);
      await checkTouchTargets(page);
    });

    test("/product/sample-perfume-1 has no overflow, meets 44px rule, and footer link is not covered by fixed bar", async ({
      page,
    }) => {
      await page.goto("/product/sample-perfume-1");
      await checkNoOverflow(page);
      await checkTouchTargets(page);

      // Scroll to the very bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Check that the last footer link is not covered by the fixed bar
      const lastFooterLink = page.locator("footer nav[aria-label='Footer'] a").last();
      await expect(lastFooterLink).toBeVisible();

      // document.elementFromPoint at the link's center must return that link
      const isTopElement = await lastFooterLink.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const topElement = document.elementFromPoint(centerX, centerY);
        return topElement === el || el.contains(topElement);
      });

      expect(isTopElement).toBe(true);
    });
  });
}

