import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pagesToTest = [
  { path: "/", name: "Landing page" },
  { path: "/sets", name: "Discovery sets listing" },
  { path: "/sets/sample-set-1", name: "Discovery set detail" },
  { path: "/cart", name: "Cart page" },
  { path: "/shop", name: "Shop listing page 1" },
  { path: "/shop?page=2", name: "Shop listing page 2" },
  { path: "/shop?q=Perfume", name: "Shop search listing" },
  { path: "/shop?brand=%5BBrand+A%5D&inStock=1", name: "Shop filtered listing" },
  { path: "/product/sample-perfume-1", name: "Product detail (in stock)" },
  { path: "/product/sample-perfume-7", name: "Product detail (sold out)" },
  { path: "/checkout", name: "Checkout page" },
  { path: "/order/sample-order-1", name: "Order confirmation page" },
  { path: "/how-it-works", name: "How it works page" },
  { path: "/shipping-returns", name: "Shipping and returns page" },
  { path: "/faq", name: "FAQ page" },
  { path: "/contact", name: "Contact page" },
  { path: "/privacy", name: "Privacy policy page" },
  { path: "/terms", name: "Terms of service page" },
  { path: "/non-existent-page-test-404", name: "Custom 404 page" },
];

for (const { path, name } of pagesToTest) {
  test(`Accessibility check on ${name} (${path}) at 390px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    if (path === "/cart" || path === "/checkout") {
      // Seed an item in cart so cart/checkout items are scanned
      await page.addInitScript(() => {
        window.localStorage.setItem(
          "decant-cart",
          JSON.stringify({
            state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
            version: 1,
          }),
        );
      });
    }

    await page.goto(path);

    const scanResults = await new AxeBuilder({ page })
      .exclude("nextjs-portal")
      .exclude("[data-nextjs-dev-tools-button]")
      .analyze();

    if (scanResults.violations.length > 0) {
      console.log(`[A11y Violations on ${path}]:`, JSON.stringify(scanResults.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description })), null, 2));
    }

    const seriousOrCritical = scanResults.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(
      seriousOrCritical,
      `Expected 0 serious or critical violations on ${path}, found: ${JSON.stringify(
        seriousOrCritical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })),
        null,
        2,
      )}`,
    ).toEqual([]);
  });
}

test("Accessibility check on Shop with filter sheet open at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/shop");
  const filterBtn = page.getByRole("button", { name: /^Filters/ });
  await expect(filterBtn).toBeVisible();
  await filterBtn.click();
  await expect(page.locator("[data-slot='sheet-content']")).toBeVisible();

  const scanResults = await new AxeBuilder({ page })
    .exclude("nextjs-portal")
    .exclude("[data-nextjs-dev-tools-button]")
    .analyze();

  if (scanResults.violations.length > 0) {
    console.log(`[A11y Violations on /shop with filter sheet open]:`, JSON.stringify(scanResults.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description })), null, 2));
  }

  const seriousOrCritical = scanResults.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );

  expect(
    seriousOrCritical,
    `Expected 0 serious or critical violations on /shop with filter sheet open, found: ${JSON.stringify(
      seriousOrCritical.map((v) => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.length })),
      null,
      2,
    )}`,
  ).toEqual([]);
});

