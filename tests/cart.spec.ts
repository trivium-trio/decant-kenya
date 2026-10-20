import { expect, test } from "@playwright/test";

test.describe("Cart functionality (FR-21, FR-23, FR-24, FR-25)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-consent",
        JSON.stringify({ state: { status: "essential_only" }, version: 1 }),
      );
    });
  });

  test("add a best seller from landing page, open /cart, see line and subtotal (Ksh 1,500)", async ({ page }) => {
    await page.goto("/");
    const addToCartButton = page.getByRole("button", { name: "Add to cart" }).first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Navigate to cart
    await page.goto("/cart");

    // Verify item line and subtotal
    await expect(page.locator("main").getByRole("heading", { name: "[Perfume 1]" })).toBeVisible();
    await expect(page.locator("main").getByText("10ml decant", { exact: true })).toBeVisible();
    await expect(page.locator("section[aria-label='Order summary']")).toContainText("Ksh 1,500");
  });

  test("increase quantity to 2, see subtotal Ksh 3,000, reload and confirm persistence", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.goto("/cart");

    // Increase quantity
    const increaseBtn = page.getByRole("button", { name: /increase quantity/i }).first();
    await expect(increaseBtn).toBeVisible();
    await increaseBtn.click();

    // Verify optimistic subtotal updates to Ksh 3,000
    await expect(page.locator("section[aria-label='Order summary']")).toContainText("Ksh 3,000");

    // Reload page and confirm persisted quantity 2 and subtotal
    await page.reload();
    await expect(page.locator("main").getByRole("heading", { name: "[Perfume 1]" })).toBeVisible();
    await expect(page.locator("section[aria-label='Order summary']")).toContainText("Ksh 3,000");
  });

  test("remove the line and see the empty state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.goto("/cart");
    await expect(page.locator("main").getByRole("heading", { name: "[Perfume 1]" })).toBeVisible();

    // Remove item
    const removeBtn = page.getByRole("button", { name: /remove/i }).first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();

    // Verify empty state
    await expect(page.getByRole("heading", { name: /your cart is empty/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /browse discovery sets/i })).toBeVisible();
  });

  test("add set from /sets/sample-set-1 and see it in cart at Ksh 4,000", async ({ page }) => {
    await page.goto("/sets/sample-set-1");
    const addBtn = page.getByRole("button", { name: /add to cart/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    await page.goto("/cart");
    await expect(page.locator("main").getByRole("heading", { name: "[Set name 1]" })).toBeVisible();
    await expect(page.locator("main").getByText("Discovery set", { exact: true })).toBeVisible();
    await expect(page.locator("section[aria-label='Order summary']")).toContainText("Ksh 4,000");
  });

  test("seeded sold-out item shows sold-out message and disables checkout button", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p7", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/cart");

    // Line displays sold-out status and message
    await expect(page.locator("main").getByRole("heading", { name: "[Perfume 7]" })).toBeVisible();
    await expect(page.getByText("[Perfume 7] is sold out.")).toBeVisible();
    await expect(page.getByText("Sold out", { exact: true })).toBeVisible();

    // Checkout button is disabled
    const checkoutButton = page.getByRole("button", { name: /checkout/i });
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeDisabled();
    await expect(page.getByText("Please remove unavailable items before proceeding to checkout.")).toBeVisible();
  });

  test("/sets/sample-set-3 shows the disabled Currently unavailable button", async ({ page }) => {
    await page.goto("/sets/sample-set-3");
    const unavailableBtn = page.getByRole("button", { name: /currently unavailable/i });
    await expect(unavailableBtn).toBeVisible();
    await expect(unavailableBtn).toBeDisabled();
    await expect(page.getByText("This set is currently unavailable because [Perfume 7] is sold out.")).toBeVisible();
  });
});
