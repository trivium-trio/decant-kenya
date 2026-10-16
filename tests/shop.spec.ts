import { expect, test } from "@playwright/test";

test.describe("Shop listing (FR-11, FR-13, FR-15)", () => {
  test("/shop shows 12 cards on page 1 and 2 on page 2 via pagination links, with aria-current='page'", async ({
    page,
  }) => {
    await page.goto("/shop");

    // Page 1 should show 12 product cards
    const cards = page.locator("main article");
    await expect(cards).toHaveCount(12);

    // Active pagination link should have aria-current="page"
    const paginationNav = page.locator("nav[aria-label='Pagination']");
    await expect(paginationNav).toBeVisible();
    const page1Link = paginationNav.locator("a[aria-current='page']");
    await expect(page1Link).toHaveText("1");
    await expect(page.getByText("Showing 1 to 12 of 14")).toBeVisible();

    // Click page 2 link
    const page2Link = paginationNav.getByRole("link", { name: "2", exact: true });
    await expect(page2Link).toBeVisible();
    await page2Link.click();
    await expect(page).toHaveURL(/page=2/);

    // Page 2 should show 2 cards
    await expect(cards).toHaveCount(2);
    const activePageLink = paginationNav.locator("a[aria-current='page']");
    await expect(activePageLink).toHaveText("2");
    await expect(page.getByText("Showing 13 to 14 of 14")).toBeVisible();
  });

  test("/shop?sort=price_asc shows [Perfume 14] first; ?sort=price_desc does not; garbage values fall back gracefully", async ({
    page,
  }) => {
    // Price low to high: [Perfume 14] is KES 900 (90000), lowest price in catalogue
    await page.goto("/shop?sort=price_asc");
    const firstCard = page.locator("main article").first();
    await expect(firstCard).toContainText("[Perfume 14]");

    // Price high to low: [Perfume 14] should not be first
    await page.goto("/shop?sort=price_desc");
    const firstDescCard = page.locator("main article").first();
    await expect(firstDescCard).not.toContainText("[Perfume 14]");

    // Garbage params should fall back gracefully without error
    const response = await page.goto("/shop?sort=x&page=-3");
    expect(response?.status()).toBe(200);
    await expect(page.locator("main article")).toHaveCount(12);
    const sortNav = page.locator("nav[aria-label='Sort']");
    const activeSort = sortNav.locator("a[aria-current='true']");
    await expect(activeSort).toHaveText("Popular");
  });

  test("sold-out [Perfume 7] is marked 'Sold out' and its button is disabled", async ({ page }) => {
    await page.goto("/shop");
    const p7Card = page.locator("main article").filter({ hasText: "[Perfume 7]" });
    await expect(p7Card).toBeVisible();

    // Badge and disabled button
    await expect(p7Card.locator("span").filter({ hasText: /^Sold out$/ })).toBeVisible();
    const btn = p7Card.getByRole("button", { name: "Sold out" });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });
});
