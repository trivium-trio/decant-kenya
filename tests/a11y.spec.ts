import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pagesToTest = [
  { path: "/", name: "Landing page" },
  { path: "/sets", name: "Discovery sets listing" },
  { path: "/sets/sample-set-1", name: "Discovery set detail" },
  { path: "/cart", name: "Cart page" },
];

for (const { path, name } of pagesToTest) {
  test(`Accessibility check on ${name} (${path}) at 390px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    if (path === "/cart") {
      // Seed an item in cart so cart items are scanned
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
