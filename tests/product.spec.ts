import { expect, test } from "@playwright/test";

test.describe("Product detail page (FR-16, FR-17, FR-18, NFR-22, NFR-34)", () => {
  test("/product/sample-perfume-1 shows h1, price, 10ml label, notes, and 2 reviews; perfume-3 shows 'No reviews yet'", async ({
    page,
  }) => {
    await page.goto("/product/sample-perfume-1");

    // Title & details
    await expect(page.getByRole("heading", { level: 1, name: "[Perfume 1]" })).toBeVisible();
    await expect(page.locator("main").getByText("10ml decant", { exact: true })).toBeVisible();
    await expect(page.locator("main").getByText("Ksh 1,500").first()).toBeVisible();

    // Scent notes
    const notesSection = page.locator("section[aria-label='Fragrance notes']");
    await expect(notesSection).toBeVisible();
    await expect(notesSection.getByText("Top", { exact: true })).toBeVisible();
    await expect(notesSection.getByText("Heart", { exact: true })).toBeVisible();
    await expect(notesSection.getByText("Base", { exact: true })).toBeVisible();

    // 2 reviews
    const reviewsSection = page.locator("section[aria-label='Customer reviews']");
    await expect(reviewsSection).toBeVisible();
    await expect(reviewsSection.getByText(/2 reviews/i)).toBeVisible();

    // Product 3 has no reviews
    await page.goto("/product/sample-perfume-3");
    const p3Reviews = page.locator("section[aria-label='Customer reviews']");
    await expect(p3Reviews.getByText("No reviews yet")).toBeVisible();
  });

  test("Add to cart works on product page using the project-visible button and updates header count", async ({
    page,
  }) => {
    await page.goto("/product/sample-perfume-1");

    // Select the button visible in this project (mobile fixed bar vs desktop inline)
    const addBtn = page.getByRole("button", { name: /add to cart/i }).filter({ visible: true });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify header updates to Cart (1)
    await expect(page.locator("header")).toContainText("Cart (1)");
  });

  test("/product/sample-perfume-7 has a disabled 'Sold out' button", async ({ page }) => {
    await page.goto("/product/sample-perfume-7");

    const soldOutBtn = page.getByRole("button", { name: /sold out/i }).filter({ visible: true });
    await expect(soldOutBtn).toBeVisible();
    await expect(soldOutBtn).toBeDisabled();
    await expect(page.locator("main span.text-destructive")).toHaveText("Sold out");
  });

  test("page has a canonical link and JSON-LD script containing Product and BreadcrumbList", async ({
    page,
  }) => {
    await page.goto("/product/sample-perfume-1");

    // Canonical link
    const canonical = page.locator("link[rel='canonical']");
    await expect(canonical).toHaveAttribute("href", /.*\/product\/sample-perfume-1$/);

    // JSON-LD scripts
    const jsonLdScripts = page.locator("script[type='application/ld+json']");
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    let hasProduct = false;
    let hasBreadcrumbs = false;

    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed["@type"] === "Product") hasProduct = true;
        if (parsed["@type"] === "BreadcrumbList") hasBreadcrumbs = true;
      }
    }

    expect(hasProduct).toBe(true);
    expect(hasBreadcrumbs).toBe(true);
  });

  test("an unknown slug shows the not-found page", async ({ page }) => {
    const response = await page.goto("/product/non-existent-perfume-slug-999");
    expect(response?.status()).toBe(404);
  });
});
