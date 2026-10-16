import { expect, test } from "@playwright/test";
import { products } from "@/lib/data/mock/data";

test.describe("Shop filters (FR-12, NFR-22)", () => {
  const brandACount = products.filter((p) => p.brand === "[Brand A]").length;
  const brandAOrBCount = products.filter(
    (p) => p.brand === "[Brand A]" || p.brand === "[Brand B]"
  ).length;
  const brandAOrBAndWoodyCount = products.filter(
    (p) => (p.brand === "[Brand A]" || p.brand === "[Brand B]") && p.family === "Woody"
  ).length;

  test("choosing one brand, then a second brand, shows union; adding scent family narrows result (AND between groups)", async ({
    page,
  }) => {
    await page.goto("/shop");

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;

    // 1. Choose first brand ([Brand A])
    if (isMobile) {
      await page.getByRole("button", { name: /^Filters/ }).click();
    }
    const container1 = isMobile ? page.locator("[data-slot='sheet-content']") : page.locator("aside");
    await container1.getByLabel("[Brand A]").check();
    await container1.getByRole("button", { name: "Apply filters" }).click();

    await expect(page).toHaveURL(/brand=%5BBrand(\+|%20)A%5D/);
    await expect(page.getByText(`${brandACount} perfumes`)).toBeVisible();

    // 2. Choose second brand ([Brand B]) -> union of Brand A and Brand B
    if (isMobile) {
      await page.getByRole("button", { name: /^Filters/ }).click();
    }
    const container2 = isMobile ? page.locator("[data-slot='sheet-content']") : page.locator("aside");
    await container2.getByLabel("[Brand B]").check();
    await container2.getByRole("button", { name: "Apply filters" }).click();

    await expect(page.getByText(`${brandAOrBCount} perfumes`)).toBeVisible();

    // 3. Add scent family "Woody" -> AND between groups (Brand A OR Brand B) AND Woody
    if (isMobile) {
      await page.getByRole("button", { name: /^Filters/ }).click();
    }
    const container3 = isMobile ? page.locator("[data-slot='sheet-content']") : page.locator("aside");
    await container3.getByLabel("Woody").check();
    await container3.getByRole("button", { name: "Apply filters" }).click();

    await expect(
      page.getByText(brandAOrBAndWoodyCount === 1 ? "1 perfume" : `${brandAOrBAndWoodyCount} perfumes`)
    ).toBeVisible();
  });

  test("'In stock only' removes [Perfume 7]", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.locator("main article").filter({ hasText: "[Perfume 7]" })).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (isMobile) {
      await page.getByRole("button", { name: /^Filters/ }).click();
    }
    const container = isMobile ? page.locator("[data-slot='sheet-content']") : page.locator("aside");
    await container.getByLabel("In stock only").check();
    await container.getByRole("button", { name: "Apply filters" }).click();

    await expect(page).toHaveURL(/inStock=1/);
    await expect(page.locator("main article").filter({ hasText: "[Perfume 7]" })).toHaveCount(0);
  });

  test("active chips appear, a chip removes just its filter, and 'Clear all' resets", async ({ page }) => {
    await page.goto("/shop?brand=%5BBrand+A%5D&family=Woody&inStock=1");

    const chipsContainer = page.locator("[aria-label='Active filters']");
    await expect(chipsContainer).toBeVisible();

    const brandChip = chipsContainer.getByRole("link", { name: /\[Brand A\]/ });
    const familyChip = chipsContainer.getByRole("link", { name: /Woody/ });
    const inStockChip = chipsContainer.getByRole("link", { name: /In stock only/ });
    const clearAllChip = chipsContainer.getByRole("link", { name: "Clear all" });

    await expect(brandChip).toBeVisible();
    await expect(familyChip).toBeVisible();
    await expect(inStockChip).toBeVisible();
    await expect(clearAllChip).toBeVisible();

    // Click brand chip to remove it
    await brandChip.click();
    await expect(page).not.toHaveURL(/brand=/);
    await expect(page).toHaveURL(/family=Woody/);
    await expect(page).toHaveURL(/inStock=1/);

    // Click 'Clear all' chip
    await page.locator("[aria-label='Active filters']").getByRole("link", { name: "Clear all" }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.locator("[aria-label='Active filters']")).toHaveCount(0);
  });

  test("on the mobile project the Filters button opens the sheet, Apply updates the URL and closes the sheet", async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name.includes("Mobile") || (page.viewportSize()?.width ?? 1280) < 768;
    if (!isMobile) {
      test.skip();
    }

    await page.goto("/shop");
    const filterBtn = page.getByRole("button", { name: /^Filters/ });
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    const sheet = page.locator("[data-slot='sheet-content']");
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "Filters" })).toBeVisible();

    await sheet.getByLabel("[Brand A]").check();
    await sheet.getByRole("button", { name: "Apply filters" }).click();

    await expect(page).toHaveURL(/brand=%5BBrand(\+|%20)A%5D/);
    await expect(sheet).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Filters (1)" })).toBeVisible();
  });

  test("garbage params (?brand=<script>&inStock=maybe&page=999) do not break the page", async ({ page }) => {
    const response = await page.goto("/shop?brand=%3Cscript%3E&inStock=maybe&page=999");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText("Shop");
  });

  test("the noindex meta tag is present for ?q=x and ?brand=%5BBrand+A%5D and absent for /shop and /shop?sort=name", async ({
    page,
  }) => {
    const noindexMeta = page.locator("meta[name='robots'][content='noindex,follow']");

    await page.goto("/shop?q=x");
    await expect(noindexMeta).toHaveCount(1);

    await page.goto("/shop?brand=%5BBrand+A%5D");
    await expect(noindexMeta).toHaveCount(1);

    await page.goto("/shop");
    await expect(noindexMeta).toHaveCount(0);

    await page.goto("/shop?sort=name");
    await expect(noindexMeta).toHaveCount(0);
  });
});
