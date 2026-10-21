import { expect, test } from "@playwright/test";

test.describe("Checkout Flow & Kenya Payments (FR-27, FR-28, FR-30, FR-37, FR-38)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
  });

  test("shows empty cart state on /checkout when no items in cart", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    const browseLink = page.getByRole("link", { name: "Browse perfumes" });
    await expect(browseLink).toBeVisible();
    await expect(browseLink).toHaveAttribute("href", "/shop");
  });

  test("displays order summary with line items, subtotal, delivery fee (KES 300), and total", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 2 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/checkout");

    // Summary heading
    await expect(page.getByRole("heading", { name: "Order Summary" })).toBeVisible();

    // Line item with quantity and price
    await expect(page.getByText("[Perfume 1]")).toBeVisible();
    await expect(page.getByText(/Qty:\s+2/)).toBeVisible();

    // Calculations
    await expect(page.getByText(/Subtotal/i)).toBeVisible();
    await expect(page.getByText(/Standard Delivery \(Kenya\)/i)).toBeVisible();
    await expect(page.getByText(/Ksh\s+300/i).first()).toBeVisible();

    // Total Amount
    await expect(page.getByText(/Total Amount/i)).toBeVisible();
    await expect(page.getByText(/Ksh\s+3,300/i).first()).toBeVisible();
  });

  test("validates required fields and shows inline errors without submitting", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/checkout");

    // Click submit without entering required fields
    const submitBtn = page.getByRole("button", { name: /Pay with M-Pesa/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Inline errors should be visible
    await expect(page.getByText("Full name must be at least 2 characters.")).toBeVisible();
    await expect(page.getByText("Phone number is required.")).toBeVisible();
    await expect(page.getByText("Estate or landmark is required.")).toBeVisible();
    await expect(page.getByText("Building, house number or door is required.")).toBeVisible();

    // URL should remain on /checkout
    expect(page.url()).toContain("/checkout");
  });

  test("validates Kenyan phone format strictly (FR-38)", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/checkout");

    const phoneInput = page.locator("#phone");
    const nameInput = page.locator("#fullName");
    const estateInput = page.locator("#estateOrLandmark");
    const buildingInput = page.locator("#buildingOrHouse");
    const submitBtn = page.getByRole("button", { name: /Pay with M-Pesa/i });

    await nameInput.fill("Wanjiku Mwangi");
    await estateInput.fill("Kilimani");
    await buildingInput.fill("House 12");

    // Invalid phone: too short
    await phoneInput.fill("07123");
    await submitBtn.click();
    await expect(page.getByText(/Enter a valid Kenyan phone number/i)).toBeVisible();

    // Invalid phone: international code not Kenya
    await phoneInput.fill("+12025550143");
    await submitBtn.click();
    await expect(page.getByText(/Enter a valid Kenyan phone number/i)).toBeVisible();

    // Invalid phone: landline prefix
    await phoneInput.fill("0201234567");
    await submitBtn.click();
    await expect(page.getByText(/Enter a valid Kenyan phone number/i)).toBeVisible();

    // Valid phone: 07 format
    await phoneInput.fill("0712345678");
    await expect(phoneInput).toHaveValue("0712345678");
  });

  test("payment method selection and separate M-Pesa phone toggle", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/checkout");

    // Default is M-Pesa
    const mpesaRadio = page.locator("#payment-mpesa");
    await expect(mpesaRadio).toBeChecked();

    // Uncheck "Use delivery phone for M-Pesa"
    const samePhoneCheckbox = page.locator("#useDeliveryPhoneForMpesa");
    await expect(samePhoneCheckbox).toBeChecked();
    await samePhoneCheckbox.uncheck();

    // Separate M-Pesa phone input should appear
    const mpesaPhoneInput = page.locator("#mpesaPhone");
    await expect(mpesaPhoneInput).toBeVisible();

    // Switch to Card
    const cardRadio = page.locator("#payment-card");
    await cardRadio.check();
    await expect(cardRadio).toBeChecked();

    // Card security guarantee note should be displayed (FR-28, NFR-24)
    await expect(page.getByText("Secure Payment Guarantee")).toBeVisible();
    await expect(page.getByText(/Raw card details are never handled by our store/i)).toBeVisible();
  });

  test("successful checkout with M-Pesa places order, clears cart, and shows confirmation page", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        }),
      );
    });

    await page.goto("/checkout");

    // Fill valid delivery info
    await page.locator("#fullName").fill("Amani Kamau");
    await page.locator("#phone").fill("0712345678");
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Westlands, Near Sarit");
    await page.locator("#buildingOrHouse").fill("Woodvale Grove, Flat 4B");
    await page.locator("#deliveryNotes").fill("Ring buzzer upon arrival");

    // Submit order
    const submitBtn = page.getByRole("button", { name: /Pay with M-Pesa/i });
    await submitBtn.click();

    // Double-submission guard & STK push waiting modal (FR-37)
    const stkModal = page.getByRole("dialog");
    await expect(stkModal).toBeVisible();
    await expect(stkModal.getByRole("heading", { name: "STK Push Sent" })).toBeVisible();
    await expect(stkModal.getByText(/STK push sent to/i)).toBeVisible();
    await expect(stkModal.getByText("0712 345 678")).toBeVisible();

    // Click "I have completed payment" to advance
    const advanceBtn = stkModal.getByRole("button", { name: /I have completed payment/i });
    await expect(advanceBtn).toBeVisible();
    await advanceBtn.click();

    // Verify navigation to /order/[id] or /order/[reference]
    await expect(page).toHaveURL(/\/order\/(order_|DK-)/, { timeout: 10000 });

    // Verify confirmation page content (FR-30)
    await expect(page.getByRole("heading", { name: "Thank you, Amani!" })).toBeVisible();
    await expect(page.getByText(/Order Confirmed/i).first()).toBeVisible();
    await expect(page.getByText(/Order Reference:\s*DK-[A-Z0-9]+/i)).toBeVisible();

    // Order items & total
    await expect(page.getByText("[Perfume 1]")).toBeVisible();
    await expect(page.getByText(/10ml Decant/i)).toBeVisible();
    await expect(page.getByText(/Total Paid/i)).toBeVisible();
    await expect(page.getByText(/Ksh\s+1,800/i).first()).toBeVisible(); // 1500 + 300 delivery

    // Delivery address details
    const shippingSection = page.locator("section[aria-labelledby='shipping-heading']");
    await expect(shippingSection.getByText("Amani Kamau")).toBeVisible();
    await expect(shippingSection.getByText("0712 345 678")).toBeVisible();
    await expect(shippingSection.getByText("Woodvale Grove, Flat 4B")).toBeVisible();
    await expect(page.getByText("Nairobi, Kenya")).toBeVisible();
    await expect(shippingSection.getByText(/Ring buzzer upon arrival/i)).toBeVisible();

    // Payment details
    await expect(page.getByText(/M-Pesa STK Push/i)).toBeVisible();

    // Continue Shopping button
    const continueShoppingBtn = page.getByRole("link", { name: /Continue Shopping/i });
    await expect(continueShoppingBtn).toBeVisible();
    await expect(continueShoppingBtn).toHaveAttribute("href", "/shop");

    // Verify cart was cleared
    const cartCount = page.getByRole("link", { name: /cart.*0/i });
    await expect(cartCount).toBeVisible();
  });
});
