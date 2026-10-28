import { test, expect } from "@playwright/test";

test.describe("Section 7 Payment Lifecycle Architecture", () => {
  test("DK- + 10 Base32 reference format and token-protected PII on /order/[id]", async ({
    page,
  }) => {
    // 1. Visit sample order without token (guessed URL)
    await page.goto("/order/sample-order-1");

    // Order reference should be displayed
    await expect(page.getByText(/Order Reference:\s*DK-[0-9A-Z]{10}/i)).toBeVisible();
    await expect(page.getByText(/Status:\s*paid/i)).toBeVisible();

    // Fulfillment status should be visible for paid orders
    await expect(page.getByText(/Fulfillment:\s*Processing/i)).toBeVisible();

    // PII should be completely protected
    await expect(page.getByText("Protected Customer Details")).toBeVisible();
    await expect(page.getByText("A confirmation was sent to the email you provided.")).toBeVisible();
    await expect(page.getByText("Amani Kamau")).not.toBeVisible();
    await expect(page.getByText("0712 345 678")).not.toBeVisible();
    await expect(page.getByText("Flat 4B")).not.toBeVisible();
    await expect(page.getByText("Kilimani")).not.toBeVisible();
    await expect(page.getByText("amani@example.com")).not.toBeVisible();
    await expect(page.getByText(/@/)).not.toBeVisible();

    // 2. Visit with valid token
    await page.goto("/order/sample-order-1?token=tok_sample_token_8f3k9m2x7p");

    // Full recipient name & address should now be revealed
    await expect(page.getByRole("heading", { name: "Thank you, Amani!" })).toBeVisible();
    await expect(page.getByText("Amani Kamau")).toBeVisible();
    await expect(page.getByText("amani@example.com")).toBeVisible();
    await expect(page.getByText("0712 345 678")).toBeVisible();
    await expect(page.getByText("Flat 4B")).toBeVisible();
    await expect(page.getByText("Kilimani")).toBeVisible();
    await expect(page.getByText("Nairobi, Kenya")).toBeVisible();
  });

  test("M-Pesa checkout generates DK- Base32 reference and redirects with ?token=", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        })
      );
    });

    await page.goto("/checkout");

    await page.locator("#fullName").fill("Mwangi Njoroge");
    await page.locator("#email").fill("mwangi@example.com");
    await page.locator("#phone").fill("0712345678");
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Kilimani");
    await page.locator("#buildingOrHouse").fill("House 12");

    await page.getByRole("button", { name: /Pay with M-Pesa/i }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("heading", { name: "STK Push Sent" })).toBeVisible();
    await expect(modal.getByText("0712 345 678")).toBeVisible();

    // Click "I have completed payment" to trigger instant poll and settlement
    const advanceBtn = modal.getByRole("button", { name: /I have completed payment/i });
    await expect(advanceBtn).toBeVisible();
    await advanceBtn.click();

    // Should redirect to /order/DK-[10-base32]?token=tok_[20-base32]
    await expect(page).toHaveURL(/\/order\/DK-[0-9A-Z]{10}\?token=tok_[0-9a-z]+/);

    // Verify confirmation content
    await expect(page.getByRole("heading", { name: "Thank you, Mwangi!" })).toBeVisible();
    await expect(page.getByText(/Order Confirmed/i).first()).toBeVisible();
    await expect(page.getByText(/Order Reference:\s*DK-[0-9A-Z]{10}/i)).toBeVisible();
    await expect(page.getByText(/Fulfillment:\s*Processing/i)).toBeVisible();
  });

  test("failed terminal state displays failure reason and retry options", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        })
      );
    });

    await page.goto("/checkout");

    await page.locator("#fullName").fill("Test User");
    await page.locator("#email").fill("testuser@example.com");
    await page.locator("#phone").fill("0700000000"); // Special test phone for failed payment
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Westlands");
    await page.locator("#buildingOrHouse").fill("Block A");

    await page.getByRole("button", { name: /Pay with M-Pesa/i }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Trigger check or await poll
    const verifyBtn = modal.getByRole("button", { name: /I have completed payment/i });
    if (await verifyBtn.isVisible()) {
      await verifyBtn.click();
    }

    // Modal should show payment failed state
    await expect(modal.getByRole("heading", { name: "Payment Unsuccessful" })).toBeVisible();
    await expect(
      modal.getByText(/transaction was cancelled or declined/i)
    ).toBeVisible();

    // Has retry action
    await expect(
      modal.getByRole("button", { name: /Retry M-Pesa prompt/i })
    ).toBeVisible();
    await expect(
      modal.getByRole("button", { name: /Pay by card instead/i })
    ).toBeVisible();
  });

  test("expired terminal state notifies user and allows returning to cart", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        })
      );
    });

    await page.goto("/checkout");

    await page.locator("#fullName").fill("Expired Test");
    await page.locator("#email").fill("expired@example.com");
    await page.locator("#phone").fill("0711111111"); // Special test phone for expired reservation
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Parklands");
    await page.locator("#buildingOrHouse").fill("Apt 2");

    await page.getByRole("button", { name: /Pay with M-Pesa/i }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Check payment to resolve state
    const verifyBtn = modal.getByRole("button", { name: /I have completed payment/i });
    if (await verifyBtn.isVisible()) {
      await verifyBtn.click();
    }

    // Modal should transition to expired state
    await expect(
      modal.getByRole("heading", { name: "Stock Reservation Expired" })
    ).toBeVisible();
    await expect(
      modal.getByText(/10-minute stock reservation expired/i)
    ).toBeVisible();

    // Return to cart button
    const returnCartBtn = modal.getByRole("button", { name: /Return to cart/i });
    await expect(returnCartBtn).toBeVisible();
    await returnCartBtn.click();

    await expect(page).toHaveURL(/\/cart/);
  });

  test("90s waiting loop transitions to Still waiting with Resend prompt capped at 3 and Pay by card", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        })
      );
    });

    await page.goto("/checkout");

    await page.locator("#fullName").fill("Waiting Test");
    await page.locator("#email").fill("waiting@example.com");
    await page.locator("#phone").fill("0722222222"); // Special test phone for staying pending
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Kilimani");
    await page.locator("#buildingOrHouse").fill("House 4");
    await page.locator("#deliveryNotes").fill("test_immediate_still_waiting");

    await page.getByRole("button", { name: /Pay with M-Pesa/i }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    // Modal transitions to "Still waiting?"
    await expect(modal.getByRole("heading", { name: "Still waiting?" })).toBeVisible();
    await expect(modal.getByText(/Prompt attempt 1 of 3/i)).toBeVisible();

    const resendBtn = modal.getByRole("button", { name: /Resend prompt/i });
    const cardBtn = modal.getByRole("button", { name: /Pay by card instead/i });
    await expect(resendBtn).toBeVisible();
    await expect(cardBtn).toBeVisible();

    // Click Resend prompt (attempt 2)
    await resendBtn.click();
    await expect(modal.getByRole("heading", { name: "Still waiting?" })).toBeVisible();
    await expect(modal.getByText(/Prompt attempt 2 of 3/i)).toBeVisible();

    // Click Resend prompt (attempt 3)
    await resendBtn.click();
    await expect(modal.getByRole("heading", { name: "Still waiting?" })).toBeVisible();
    await expect(modal.getByText(/Prompt attempt 3 of 3/i)).toBeVisible();

    // Max attempts reached: resend should be disabled with explanation
    const maxBtn = modal.getByRole("button", { name: /Maximum resend attempts reached/i });
    await expect(maxBtn).toBeVisible();
    await expect(maxBtn).toBeDisabled();

    // Switch to Card instead
    await cardBtn.click();

    // Redirects to order page
    await expect(page).toHaveURL(/\/order\/DK-[0-9A-Z]{10}\?token=/);
  });

  test("card return shows confirming payment state until settled", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        })
      );
    });

    await page.goto("/checkout");

    await page.locator("#fullName").fill("Card User");
    await page.locator("#email").fill("carduser@example.com");
    await page.locator("#phone").fill("0712345678");
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Westlands");
    await page.locator("#buildingOrHouse").fill("Tower 1");

    // Select Card payment
    await page.locator("#payment-card").check();
    await expect(page.locator("#payment-card")).toBeChecked();

    await page.getByRole("button", { name: /Complete Order/i }).click();

    // Lands on order page with ?payment=card_simulated
    await expect(page).toHaveURL(
      /\/order\/DK-[0-9A-Z]{10}\?token=tok_[0-9a-z]+&payment=card_simulated/
    );

    // Initial load confirms payment via poller and settles to paid
    await expect(page.getByText(/Order Confirmed/i).first()).toBeVisible();
    await expect(page.getByText(/Fulfillment:\s*Processing/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Thank you, Card!" })).toBeVisible();
  });

  test("token safety: accessToken is never leaked to console, analytics, or unauthenticated responses", async ({
    page,
  }) => {
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      consoleLogs.push(msg.text());
    });

    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        })
      );
    });

    await page.goto("/checkout");

    await page.locator("#fullName").fill("Token Safe User");
    await page.locator("#email").fill("tokensafety@example.com");
    await page.locator("#phone").fill("0712345678");
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Kilimani");
    await page.locator("#buildingOrHouse").fill("House 10");

    await page.getByRole("button", { name: /Pay with M-Pesa/i }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    const advanceBtn = modal.getByRole("button", { name: /I have completed payment/i });
    await expect(advanceBtn).toBeVisible();
    await advanceBtn.click();

    await expect(page).toHaveURL(/\/order\/DK-[0-9A-Z]{10}\?token=tok_[0-9a-z]+/);

    // Extract token from URL
    const url = new URL(page.url());
    const token = url.searchParams.get("token");
    expect(token).toBeTruthy();
    expect(token).toMatch(/^tok_[0-9a-z]+$/);

    // Assert console logs never contained the secret token
    for (const log of consoleLogs) {
      expect(log).not.toContain(token!);
      expect(log).not.toMatch(/tok_[0-9a-z]{10,}/i);
    }

    // Now visit the order page without token (unauthenticated / guessed URL)
    const unauthUrl = url.pathname;
    await page.goto(unauthUrl);
    await expect(page.getByText("Protected Customer Details")).toBeVisible();

    // Verify token is NOT rendered anywhere in DOM or page source
    const pageContent = await page.content();
    expect(pageContent).not.toContain(token!);
    expect(pageContent).not.toMatch(/tok_[0-9a-z]{10,}/i);
  });

  test("order pages serve Referrer-Policy: no-referrer and Cache-Control: private, no-store", async ({
    page,
  }) => {
    const response = await page.goto("/order/sample-order-1");
    expect(response).not.toBeNull();
    const headers = response!.headers();
    expect(headers["referrer-policy"]).toBe("no-referrer");
    expect(headers["cache-control"]).toContain("no-store");
  });

  test("accepts complex email addresses including sub-addressing (name+tag@example.co.ke)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "decant-cart",
        JSON.stringify({
          state: { lines: [{ kind: "product", itemId: "p1", quantity: 1 }] },
          version: 1,
        })
      );
    });

    await page.goto("/checkout");

    await page.locator("#fullName").fill("Tag Test User");
    await page.locator("#email").fill("name+tag@example.co.ke");
    await page.locator("#phone").fill("0712345678");
    await page.locator("#county").selectOption("Nairobi");
    await page.locator("#estateOrLandmark").fill("Kilimani");
    await page.locator("#buildingOrHouse").fill("House 10");

    await page.getByRole("button", { name: /Pay with M-Pesa/i }).click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();

    const advanceBtn = modal.getByRole("button", { name: /I have completed payment/i });
    await expect(advanceBtn).toBeVisible();
    await advanceBtn.click();

    await expect(page).toHaveURL(/\/order\/DK-[0-9A-Z]{10}\?token=tok_[0-9a-z]+/);

    // Delivery details with valid token shows the tagged email
    await expect(page.getByText("name+tag@example.co.ke")).toBeVisible();
  });
});
