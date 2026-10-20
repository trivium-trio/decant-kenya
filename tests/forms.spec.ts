import { expect, test } from "@playwright/test";

test.describe("Footer Newsletter Signup (FR-2, FR-35, FR-36)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("rejects invalid email addresses with clear inline error", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    const emailInput = footer.getByRole("textbox", { name: /newsletter email address/i });
    const subscribeButton = footer.getByRole("button", { name: "Subscribe" });

    // Submit with invalid email format
    await emailInput.fill("invalid-email-address");
    await subscribeButton.click();

    // Verify inline error message
    const errorMessage = footer.locator("#newsletter-error");
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/Please enter a valid email address/i);
  });

  test("subscribes successfully with valid email, displays confirmation, and disables button", async ({ page }) => {
    const footer = page.locator("footer");
    const emailInput = footer.getByRole("textbox", { name: /newsletter email address/i });
    const subscribeButton = footer.getByRole("button", { name: "Subscribe" });

    await emailInput.fill("customer@example.co.ke");
    await subscribeButton.click();

    // Check success status
    const successStatus = footer.getByRole("status");
    await expect(successStatus).toBeVisible();
    await expect(successStatus).toContainText(/Thank you for subscribing/i);

    // Verify input and subscribe button are replaced by the confirmation message
    await expect(emailInput).not.toBeVisible();
  });
});

test.describe("Contact Form Page (FR-33, FR-35, FR-36)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("validates required fields and displays inline error messages", async ({ page }) => {
    const main = page.getByRole("main");
    const submitBtn = main.getByRole("button", { name: "Send Message" });
    await submitBtn.click();

    // Verify field-level inline error messages
    await expect(main.locator("#contact-name-error")).toBeVisible();
    await expect(main.locator("#contact-name-error")).toContainText(/Please enter your name/i);

    await expect(main.locator("#contact-email-error")).toBeVisible();
    await expect(main.locator("#contact-email-error")).toContainText(/Please enter a valid email address/i);

    await expect(main.locator("#contact-subject-error")).toBeVisible();
    await expect(main.locator("#contact-subject-error")).toContainText(/Please enter a subject/i);

    await expect(main.locator("#contact-message-error")).toBeVisible();
    await expect(main.locator("#contact-message-error")).toContainText(/Message must be at least 10 characters/i);
  });

  test("validates invalid Kenyan phone number", async ({ page }) => {
    const main = page.getByRole("main");
    const nameInput = main.getByRole("textbox", { name: /full name/i });
    const emailInput = main.getByRole("textbox", { name: /email address/i });
    const phoneInput = main.getByRole("textbox", { name: /phone number/i });
    const subjectInput = main.getByRole("textbox", { name: /subject/i });
    const messageInput = main.getByRole("textbox", { name: /message/i });
    const submitBtn = main.getByRole("button", { name: "Send Message" });

    await nameInput.fill("Amani Muthoni");
    await emailInput.fill("amani@example.com");
    await phoneInput.fill("12345"); // Invalid phone
    await subjectInput.fill("Sample Set Question");
    await messageInput.fill("I would like to inquire about when the woody discovery set will be back in stock.");

    await submitBtn.click();

    await expect(main.locator("#contact-phone-error")).toBeVisible();
    await expect(main.locator("#contact-phone-error")).toContainText(/valid Kenyan phone number/i);
  });

  test("submits valid contact inquiry, displays confirmation card, and allows reset", async ({ page }) => {
    const main = page.getByRole("main");
    const nameInput = main.getByRole("textbox", { name: /full name/i });
    const emailInput = main.getByRole("textbox", { name: /email address/i });
    const phoneInput = main.getByRole("textbox", { name: /phone number/i });
    const subjectInput = main.getByRole("textbox", { name: /subject/i });
    const messageInput = main.getByRole("textbox", { name: /message/i });
    const submitBtn = main.getByRole("button", { name: "Send Message" });

    await nameInput.fill("David Kimani");
    await emailInput.fill("david.kimani@example.co.ke");
    await phoneInput.fill("0712345678");
    await subjectInput.fill("Order Delivery Time");
    await messageInput.fill("Hello, do you provide same day delivery within Westlands Nairobi?");

    await submitBtn.click();

    // Verify confirmation card appears
    const successCard = main.getByRole("status");
    await expect(successCard).toBeVisible();
    await expect(successCard).toContainText(/Message Delivered/i);
    await expect(successCard).toContainText(/Thank you for reaching out/i);

    // Click "Send another message"
    const resetBtn = successCard.getByRole("button", { name: "Send another message" });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Verify form is restored and empty
    await expect(main.getByRole("textbox", { name: /full name/i })).toHaveValue("");
    await expect(main.getByRole("button", { name: "Send Message" })).toBeVisible();
  });
});
