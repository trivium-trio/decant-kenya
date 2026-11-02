import { test, expect } from "@playwright/test";

test.describe("Milestone B10: Storefront Revalidation & Live Backend Integration", () => {
  const revalidateSecret = process.env.REVALIDATE_SECRET || "test_revalidate_secret_1234567890";

  test.beforeAll(() => {
    process.env.REVALIDATE_SECRET = revalidateSecret;
  });

  test.beforeEach(() => {
    test.setTimeout(90000);
  });

  test("POST /api/revalidate enforces authentication and timestamp replay guards", async ({
    request,
  }) => {
    // 1. Missing secret -> 401
    const missingSecretRes = await request.post("/api/revalidate", {
      data: { tag: "catalogue", timestamp: Date.now() },
    });
    expect(missingSecretRes.status()).toBe(401);

    // 2. Invalid secret -> 401
    const invalidSecretRes = await request.post("/api/revalidate", {
      headers: { "x-revalidate-secret": "wrong_secret_value" },
      data: { tag: "catalogue", timestamp: Date.now() },
    });
    expect(invalidSecretRes.status()).toBe(401);

    // 3. Expired timestamp (> 5 minutes old) -> 400
    const expiredTimestamp = Date.now() - 6 * 60 * 1000;
    const expiredRes = await request.post("/api/revalidate", {
      headers: { "x-revalidate-secret": revalidateSecret },
      data: { tag: "catalogue", timestamp: expiredTimestamp },
    });
    expect(expiredRes.status()).toBe(400);

    // 4. Valid secret & current timestamp -> 200
    const validRes = await request.post("/api/revalidate", {
      headers: { "x-revalidate-secret": revalidateSecret },
      data: { tag: "catalogue", timestamp: Date.now() },
    });
    expect(validRes.status()).toBe(200);
    const validJson = await validRes.json();
    expect(validJson.revalidated).toBe(true);
    expect(validJson.tags).toContain("catalogue");
  });

  test("Remote ShopApi adapter functions: cart validation, order creation, masked view and switch-to-card", async () => {
    const { createRemoteApi } = await import("../src/lib/data/remote");
    const api = createRemoteApi();

    // 1. List products from backend
    const products = await api.listProducts({ pageSize: 5 });
    expect(products.items.length).toBeGreaterThan(0);
    const sampleProduct = products.items[0];
    expect(sampleProduct.slug).toBeDefined();

    // 2. Validate cart
    const cartValidation = await api.validateCart([
      { kind: "product", itemId: sampleProduct.slug, quantity: 1 },
    ]);
    expect(cartValidation.lines.length).toBe(1);
    expect(cartValidation.subtotal.amount).toBeGreaterThan(0);

    // 3. Create test order
    const testEmail = `b10test_${Date.now()}@example.com`;
    const createdOrder = await api.createOrder({
      items: [{ id: sampleProduct.slug, kind: "product", quantity: 1 }],
      email: testEmail,
      paymentMethod: "mpesa",
      address: {
        fullName: "B10 Integration Tester",
        phone: "+254710000000",
        county: "Nairobi",
        estateOrLandmark: "Westlands",
        buildingOrHouse: "Delta Corner",
      },
    });

    expect(createdOrder.reference).toMatch(/^DK-[0-9A-Z]{10}$/);
    expect(createdOrder.accessToken).toBeDefined();

    // 4. Retrieve order with token -> reveals full details
    const fullOrder = await api.getOrder(createdOrder.reference, createdOrder.accessToken);
    expect(fullOrder).not.toBeNull();
    expect(fullOrder?.address.fullName).toBe("B10 Integration Tester");
    expect(fullOrder?.email).toBe(testEmail);

    // 5. Retrieve order without token -> masked PII
    const maskedOrder = await api.getOrder(createdOrder.reference);
    expect(maskedOrder).not.toBeNull();
    expect(maskedOrder?.address.county).toBe("Nairobi");
    expect(maskedOrder?.email).toBeUndefined();
    expect(maskedOrder?.address.fullName).not.toBe("B10 Integration Tester");

    // 6. Switch order to card -> returns authorizationUrl
    const cardSession = await api.switchOrderToCard(
      createdOrder.reference,
      createdOrder.accessToken!
    );
    expect(cardSession.authorizationUrl).toBeDefined();
    expect(cardSession.authorizationUrl.length).toBeGreaterThan(0);
  });
});
