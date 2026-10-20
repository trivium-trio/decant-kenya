import { expect, test } from "@playwright/test";

test.describe("Related scents and SEO infrastructure (FR-19, NFR-21, NFR-22, NFR-23)", () => {
  test("product page renders Similar scents with up to 4 in-stock related products excluding self", async ({
    page,
  }) => {
    await page.goto("/product/sample-perfume-1");

    const similarHeading = page.getByRole("heading", { name: "Similar scents" });
    await expect(similarHeading).toBeVisible();

    const similarSection = page.locator("section[aria-labelledby='similar-scents-heading']");
    const cards = similarSection.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(4);

    // Ensure sample-perfume-1 itself is NOT in similar scents
    for (let i = 0; i < count; i++) {
      const link = cards.nth(i).locator("a").first();
      const href = await link.getAttribute("href");
      expect(href).not.toBe("/product/sample-perfume-1");
    }
  });

  test("robots.txt returns 200 and disallows sensitive routes while referencing sitemap", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();

    expect(body).toMatch(/user-agent:\s*\*/i);
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /cart");
    expect(body).toContain("Disallow: /checkout");
    expect(body).toContain("Disallow: /order/");
    expect(body).toContain("Disallow: /account");
    expect(body).toMatch(/Sitemap: https?:\/\/.*\/sitemap\.xml/);
  });

  test("sitemap.xml returns 200 and includes static routes and dynamic product/set routes", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();

    expect(body).toContain("<urlset");
    expect(body).toContain("/shop");
    expect(body).toContain("/sets");
    expect(body).toContain("/product/sample-perfume-1");
    expect(body).toContain("/sets/sample-set-1");
  });

  test("product detail page includes valid JSON-LD for Product and BreadcrumbList", async ({
    page,
  }) => {
    await page.goto("/product/sample-perfume-1");

    const jsonLdElements = page.locator("script[type='application/ld+json']");
    const count = await jsonLdElements.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const jsonObjects: Record<string, unknown>[] = [];
    for (let i = 0; i < count; i++) {
      const content = await jsonLdElements.nth(i).textContent();
      if (content) {
        jsonObjects.push(JSON.parse(content));
      }
    }

    const productLd = jsonObjects.find((obj) => obj["@type"] === "Product");
    expect(productLd).toBeDefined();
    expect(productLd?.name).toBe("[Perfume 1]");
    expect(productLd?.offers).toBeDefined();

    const breadcrumbLd = jsonObjects.find((obj) => obj["@type"] === "BreadcrumbList");
    expect(breadcrumbLd).toBeDefined();
    expect(Array.isArray(breadcrumbLd?.itemListElement)).toBe(true);
  });
});
