import { expect, test } from "@playwright/test";

test.describe("Mini-Cart Drawer (FR-23, FR-25, FR-26)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.clear();
      window.localStorage.setItem(
        "decant-consent",
        JSON.stringify({ state: { status: "essential_only" }, version: 1 }),
      );
    });
  });

  test("clicking Add to cart opens drawer automatically with line items and subtotal", async ({ page }) => {
    await page.goto("/product/sample-perfume-1");

    const addToCartBtn = page
      .getByRole("button", { name: /add to cart \(\[Perfume 1\]\)/i })
      .filter({ visible: true })
      .first();
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Drawer should open automatically
    const drawer = page.locator("[data-slot='sheet-content']");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("heading", { name: "Shopping Cart" })).toBeVisible();

    // Check item details
    await expect(drawer.getByText("[Perfume 1]")).toBeVisible();
    await expect(drawer.getByText("10ml decant")).toBeVisible();
    await expect(drawer.getByText(/Ksh\s+1,500/).first()).toBeVisible();

    // Check subtotal
    await expect(drawer.getByText(/Subtotal/i)).toBeVisible();
    await expect(drawer.getByText(/Ksh\s+1,500/i).first()).toBeVisible();
  });

  test("drawer allows increasing, decreasing, and removing line items", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/");

    // Open drawer via header cart button
    const cartButton = page.getByRole("link", { name: /cart.*1/i });
    await cartButton.click();

    const drawer = page.locator("[data-slot='sheet-content']");
    await expect(drawer).toBeVisible();

    // Increase quantity
    const increaseBtn = drawer.getByRole("button", { name: /Increase quantity/i });
    await expect(increaseBtn).toBeVisible();
    await increaseBtn.click();

    // Subtotal should update to 3,000
    await expect(drawer.getByText(/Ksh\s+3,000/).first()).toBeVisible();

    // Decrease quantity
    const decreaseBtn = drawer.getByRole("button", { name: /Decrease quantity/i });
    await decreaseBtn.click();
    await expect(drawer.getByText(/Ksh\s+1,500/).first()).toBeVisible();

    // Remove line item
    const removeBtn = drawer.getByRole("button", { name: /Remove/i });
    await removeBtn.click();

    // Empty state should appear
    await expect(drawer.getByText("Your cart is empty")).toBeVisible();
    const startShoppingLink = drawer.getByRole("link", { name: "Browse perfumes" });
    await expect(startShoppingLink).toBeVisible();
    await expect(startShoppingLink).toHaveAttribute("href", "/shop");
  });

  test("touch targets for drawer controls are at least 44px", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/");
    const cartButton = page.getByRole("link", { name: /cart.*1/i });
    await cartButton.click();

    const drawer = page.locator("[data-slot='sheet-content']");
    await expect(drawer).toBeVisible();

    const buttons = [
      drawer.getByRole("button", { name: /Increase quantity/i }),
      drawer.getByRole("button", { name: /Decrease quantity/i }),
      drawer.getByRole("button", { name: /Remove/i }),
      drawer.getByRole("link", { name: /Proceed to checkout/i }),
    ];

    for (const btn of buttons) {
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(43.9);
      }
    }
  });

  test("Proceed to checkout navigates to /checkout", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/");
    const cartButton = page.getByRole("link", { name: /cart.*1/i });
    await cartButton.click();

    const checkoutLink = page.getByRole("link", { name: /Proceed to checkout/i });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    await expect(page).toHaveURL(/\/checkout/);
  });

  test("sold out item in cart disables checkout in drawer", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p7", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/");
    const cartButton = page.getByRole("link", { name: /cart.*1/i });
    await cartButton.click();

    const drawer = page.locator("[data-slot='sheet-content']");
    await expect(drawer).toBeVisible();

    // Shows sold out badge
    await expect(drawer.getByText(/Sold out/i).first()).toBeVisible();

    // Checkout button should be disabled
    const disabledCheckout = drawer.getByRole("button", { name: /Proceed to checkout/i });
    await expect(disabledCheckout).toBeDisabled();
  });
});
