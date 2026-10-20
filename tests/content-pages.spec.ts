import { expect, test } from "@playwright/test";

test.describe("Static Content & Support Pages (FR-33, FR-36, NFR-21, NFR-22)", () => {
  const contentPages = [
    {
      path: "/how-it-works",
      expectedTitle: /How It Works/i,
      headingText: "How It Works",
    },
    {
      path: "/shipping-returns",
      expectedTitle: /Shipping & Returns/i,
      headingText: "Shipping & Returns",
    },
    {
      path: "/faq",
      expectedTitle: /Frequently Asked Questions/i,
      headingText: "Frequently Asked Questions",
    },
    {
      path: "/privacy",
      expectedTitle: /Privacy Policy/i,
      headingText: "Privacy Policy",
    },
    {
      path: "/terms",
      expectedTitle: /Terms of Service/i,
      headingText: "Terms of Service",
    },
  ];

  for (const { path, expectedTitle, headingText } of contentPages) {
    test(`${path} renders with 200 status, correct title, and semantic landmarks`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      await expect(page).toHaveTitle(expectedTitle);

      const main = page.getByRole("main");
      await expect(main).toBeVisible();

      const h1 = main.getByRole("heading", { level: 1, name: headingText });
      await expect(h1).toBeVisible();
    });
  }

  test("/privacy contains the FR-36 Data-Collection Inventory table", async ({ page }) => {
    await page.goto("/privacy");

    // Check heading for inventory
    await expect(page.getByRole("heading", { name: /Data-Collection Inventory/i })).toBeVisible();

    // Check table and rows
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Check table headers
    await expect(table.locator("th").filter({ hasText: /Touchpoint \/ Form/i })).toBeVisible();
    await expect(table.locator("th").filter({ hasText: /Personal Fields Collected/i })).toBeVisible();
    await expect(table.locator("th").filter({ hasText: /Processing Endpoint/i })).toBeVisible();
    await expect(table.locator("th").filter({ hasText: /Purpose & Lawful Basis/i })).toBeVisible();
    await expect(table.locator("th").filter({ hasText: /Retention Period/i })).toBeVisible();

    // Verify key touchpoints in the table rows
    await expect(table.getByText("Checkout & Order Delivery")).toBeVisible();
    await expect(table.getByText("M-Pesa Payment (STK Push)")).toBeVisible();
    await expect(table.getByText("Customer Support Contact")).toBeVisible();
    await expect(table.getByText("Footer Newsletter Signup")).toBeVisible();
    await expect(table.getByText("Privacy & Consent Preferences")).toBeVisible();

    // Verify Kenya DPA statutory references
    await expect(page.getByText(/Kenya.*Data Protection Act.*2019/i).first()).toBeVisible();
    await expect(page.getByText(/Section 26/i).first()).toBeVisible();
  });

  test("/terms contains the independent decanter IP disclaimer", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Independent Decanter Disclaimer/i })).toBeVisible();
    await expect(page.getByText(/not affiliated with, associated with, endorsed by/i)).toBeVisible();
    await expect(page.getByText(/Laws of Kenya/i)).toBeVisible();
  });

  test("/faq accordion expands/collapses with mouse click and keyboard interaction", async ({ page }) => {
    await page.goto("/faq");

    // First item is open by default
    const firstAnswer = page.getByText(/A perfume decant is 100% genuine fragrance transferred directly/i);
    await expect(firstAnswer).toBeVisible();

    // Find the authenticity question trigger
    const authTrigger = page.getByRole("button", { name: /Are your fragrances 100% genuine/i });
    await expect(authTrigger).toBeVisible();

    // Click to expand
    await authTrigger.click();
    const authAnswer = page.getByText(/Every decant is hand-drawn using sterile laboratory pipettes/i);
    await expect(authAnswer).toBeVisible();

    // Find M-Pesa question trigger
    const mpesaTrigger = page.getByRole("button", { name: /How do M-Pesa payments work/i });
    await expect(mpesaTrigger).toBeVisible();

    // Keyboard interaction: Focus and press Enter
    await mpesaTrigger.focus();
    await page.keyboard.press("Enter");

    const mpesaAnswer = page.getByText(/We utilize official M-Pesa STK Push/i);
    await expect(mpesaAnswer).toBeVisible();
  });
});
