import { expect, test } from "@playwright/test";

test.describe("Shop search (FR-4, FR-14)", () => {
  test("the header Search link goes to /shop#search and the input is focused", async ({ page }) => {
    await page.goto("/");
    const searchLink = page.getByRole("link", { name: "Search" });
    await expect(searchLink).toBeVisible();
    await searchLink.click();
    await expect(page).toHaveURL(/\/shop#search$/);
    const searchInput = page.locator("#search");
    await expect(searchInput).toBeFocused();
  });

  test("searching 'Perfume 14' by typing and pressing Enter updates the URL (q=...) and shows only that product", async ({
    page,
  }) => {
    await page.goto("/shop");
    const searchInput = page.locator("#search");
    await searchInput.fill("Perfume 14");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/q=Perfume(\+|%20)14/);

    const cards = page.locator("main article");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("[Perfume 14]");
    await expect(page.getByText("1 perfume")).toBeVisible();
  });

  test("a query with no matches shows the no-results state with the clear link, and the link restores the full list", async ({
    page,
  }) => {
    await page.goto("/shop");
    const searchInput = page.locator("#search");
    await searchInput.fill("NonExistentFragranceXYZ");
    await searchInput.press("Enter");

    await expect(page.getByText(/No perfumes match/i)).toBeVisible();
    await expect(page.getByText("No perfumes", { exact: true })).toBeVisible();

    const clearLink = page.getByRole("link", { name: "Clear search and filters" });
    await expect(clearLink).toBeVisible();
    await clearLink.click();

    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.locator("main article")).toHaveCount(12);
    await expect(page.getByText("14 perfumes")).toBeVisible();
  });

  test("sort links and pagination links keep q and the filters", async ({ page }) => {
    // Navigate with both q and brand filter
    await page.goto("/shop?q=Perfume&brand=%5BBrand+A%5D");

    // Click sort link
    const sortNav = page.locator("nav[aria-label='Sort']");
    const priceAscLink = sortNav.getByRole("link", { name: "Price: low to high" });
    await priceAscLink.click();

    await expect(page).toHaveURL(/q=Perfume/);
    await expect(page).toHaveURL(/brand=%5BBrand(\+|%20)A%5D/);
    await expect(page).toHaveURL(/sort=price_asc/);

    // Navigate with q=Perfume to test pagination links
    await page.goto("/shop?q=Perfume");
    const paginationNav = page.locator("nav[aria-label='Pagination']");
    const page2Link = paginationNav.getByRole("link", { name: "2", exact: true });
    await page2Link.click();

    await expect(page).toHaveURL(/q=Perfume/);
    await expect(page).toHaveURL(/page=2/);
  });
});
