import type { ShopApi } from "../api";
import type {
  AnalyticsEventInput,
  CheckoutInput,
  ConsentChoice,
  ConsentRecord,
  ContactInput,
  ContactMessage,
  FormSubmitResult,
  Money,
  NewsletterInput,
  NewsletterSignup,
  Order,
  OrderItem,
  PricedCartLine,
  Product,
  ProductQuery,
  SearchSuggestion,
} from "../types";
import { products, reviews, sets } from "./data";

export const mockConsentRecords: (ConsentChoice | ConsentRecord)[] = [];
export const mockAnalyticsEvents: AnalyticsEventInput[] = [];

const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateBase32(length = 10): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE32_ALPHABET[Math.floor(Math.random() * BASE32_ALPHABET.length)];
  }
  return result;
}

function maskEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const [user, domain] = email.split("@");
  if (!domain) return "••••••••";
  const maskedUser = user.length > 2 ? `${user[0]}••••${user[user.length - 1]}` : "••••";
  return `${maskedUser}@${domain}`;
}

const defaultSampleOrder: Order = {
  id: "sample-order-1",
  reference: "DK-8F3K9M2X7P",
  accessToken: "tok_sample_token_8f3k9m2x7p",
  items: [
    {
      id: "p1",
      name: "[Perfume 1]",
      brand: "[Brand A]",
      kind: "product",
      quantity: 1,
      unitPrice: 150000,
      totalPrice: 150000,
    },
  ],
  subtotal: 150000,
  deliveryFee: 30000,
  total: 180000,
  address: {
    fullName: "Amani Kamau",
    phone: "+254712345678",
    county: "Nairobi",
    estateOrLandmark: "Kilimani",
    buildingOrHouse: "Flat 4B",
    deliveryNotes: "Call upon arrival",
  },
  email: "amani@example.com",
  paymentMethod: "mpesa",
  paymentStatus: "paid",
  fulfillmentStatus: "processing",
  chargeAttempts: 1,
  createdAt: "2026-10-20T12:00:00.000Z",
  reservationExpiresAt: "2026-10-20T12:10:00.000Z",
};

const mockOrders = new Map<string, Order>([
  ["sample-order-1", defaultSampleOrder],
  ["DK-100001", defaultSampleOrder],
  ["DK-8F3K9M2X7P", defaultSampleOrder],
]);

const sorters: Record<NonNullable<ProductQuery["sort"]>, (a: Product, b: Product) => number> = {
  popular: () => 0,
  price_asc: (a, b) => a.price.amount - b.price.amount,
  price_desc: (a, b) => b.price.amount - a.price.amount,
  name: (a, b) => a.name.localeCompare(b.name),
};

export function createMockApi(): ShopApi {
  return {
    async listProducts(query = {}) {
      const { search, brands, families, inStockOnly, sort = "popular", page = 1, pageSize = 12 } = query;
      const q = search?.trim().toLowerCase();
      const filtered = products.filter((p) => {
        const matchesSearch = !q || p.brand.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
        const matchesBrand = !brands || brands.length === 0 || brands.includes(p.brand);
        const matchesFamily = !families || families.length === 0 || (Boolean(p.family) && families.includes(p.family!));
        const matchesStock = !inStockOnly || p.stock !== "out_of_stock";
        return matchesSearch && matchesBrand && matchesFamily && matchesStock;
      });
      const sorter = sorters[sort] ?? sorters.popular;
      const sorted = sort === "popular" ? [...filtered] : [...filtered].sort(sorter);
      const safePageSize = pageSize > 0 ? pageSize : 12;
      const totalPages = Math.max(1, Math.ceil(sorted.length / safePageSize));
      const safePage = Math.max(1, Math.min(page, totalPages));
      const start = (safePage - 1) * safePageSize;
      return { items: sorted.slice(start, start + safePageSize), total: sorted.length, page: safePage, pageSize: safePageSize };
    },

    async listFacets() {
      const brands = Array.from(new Set(products.map((p) => p.brand))).sort((a, b) => a.localeCompare(b));
      const families = Array.from(
        new Set(products.map((p) => p.family).filter((f): f is string => Boolean(f))),
      ).sort((a, b) => a.localeCompare(b));
      return { brands, families };
    },

    async getProduct(slug) {
      return products.find((p) => p.slug === slug) ?? null;
    },

    async getBestSellers(limit = 4) {
      return products.filter((p) => p.stock !== "out_of_stock").slice(0, limit);
    },

    async listRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
      const current = products.find((p) => p.id === productId);
      if (!current) return [];

      const related = products.filter((p) => {
        if (p.id === productId || p.stock === "out_of_stock") return false;
        const sameFamily = Boolean(current.family && p.family === current.family);
        const sameBrand = Boolean(current.brand && p.brand === current.brand);
        return sameFamily || sameBrand;
      });

      return related.slice(0, limit);
    },

    async suggestProducts(query: string, limit = 5): Promise<SearchSuggestion[]> {
      const q = query.trim().toLowerCase();
      if (q.length < 2) return [];

      const matched = products
        .filter((p) => {
          const nameMatch = p.name.toLowerCase().includes(q);
          const brandMatch = p.brand.toLowerCase().includes(q);
          const familyMatch = Boolean(p.family && p.family.toLowerCase().includes(q));
          return nameMatch || brandMatch || familyMatch;
        })
        .slice(0, limit);

      return matched.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        family: p.family ?? "",
        price: p.price.amount,
        inStock: p.stock !== "out_of_stock",
      }));
    },

    async listSets() {
      return sets;
    },

    async getSet(slug) {
      const set = sets.find((s) => s.slug === slug);
      if (!set) return null;
      return { set, products: products.filter((p) => set.productIds.includes(p.id)) };
    },

    async listReviews({ productId, limit } = {}) {
      const list = productId ? reviews.filter((r) => r.productId === productId) : reviews;
      return limit ? list.slice(0, limit) : list;
    },

    async validateCart(lines) {
      const issues: string[] = [];
      const priced: PricedCartLine[] = [];
      for (const line of lines) {
        if (line.kind === "product") {
          const product = products.find((p) => p.id === line.itemId);
          if (!product) {
            issues.push(`Item ${line.itemId} no longer exists.`);
            continue;
          }
          const available = product.stock !== "out_of_stock";
          if (!available) issues.push(`${product.name} is sold out.`);
          priced.push({ ...line, name: product.name, unitPrice: product.price, available });
        } else {
          const set = sets.find((s) => s.id === line.itemId);
          if (!set) {
            issues.push(`Set ${line.itemId} no longer exists.`);
            continue;
          }
          const hasSoldOut = set.productIds.some((pid) => {
            const p = products.find((prod) => prod.id === pid);
            return p?.stock === "out_of_stock";
          });
          const available = !hasSoldOut;
          if (!available) issues.push(`${set.name} includes a sold-out item.`);
          priced.push({ ...line, name: set.name, unitPrice: set.price, available });
        }
      }
      const currency = priced[0]?.unitPrice.currency ?? "KES";
      const subtotal: Money = {
        amount: priced.filter((l) => l.available).reduce((sum, l) => sum + l.unitPrice.amount * l.quantity, 0),
        currency,
      };
      return { lines: priced, subtotal, issues };
    },

    async createOrder(input: CheckoutInput): Promise<Order> {
      const orderItems: OrderItem[] = [];
      for (const item of input.items) {
        if (item.kind === "product") {
          const product = products.find((p) => p.id === item.id || p.slug === item.id);
          if (!product || product.stock === "out_of_stock") {
            throw new Error(`Product ${item.id} is out of stock or unavailable.`);
          }
          orderItems.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            kind: "product",
            quantity: item.quantity,
            unitPrice: product.price.amount,
            totalPrice: product.price.amount * item.quantity,
          });
        } else {
          const set = sets.find((s) => s.id === item.id || s.slug === item.id);
          if (!set) {
            throw new Error(`Discovery set ${item.id} no longer exists.`);
          }
          const hasSoldOut = set.productIds.some((pid) => {
            const p = products.find((prod) => prod.id === pid);
            return p?.stock === "out_of_stock";
          });
          if (hasSoldOut) {
            throw new Error(`Discovery set ${set.name} includes a sold-out fragrance.`);
          }
          orderItems.push({
            id: set.id,
            name: set.name,
            kind: "set",
            quantity: item.quantity,
            unitPrice: set.price.amount,
            totalPrice: set.price.amount * item.quantity,
          });
        }
      }

      const subtotal = orderItems.reduce((acc, item) => acc + item.totalPrice, 0);
      const deliveryFee = 30000; // Fixed KES 300 delivery fee (minor units)
      const total = subtotal + deliveryFee;

      const orderId = `order_${Date.now()}_${generateBase32(6)}`;
      const reference = `DK-${generateBase32(10)}`;
      const accessToken = `tok_${generateBase32(20).toLowerCase()}`;
      const now = new Date();
      const reservationExpiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

      let paymentStatus: "pending" | "paid" | "failed" | "expired" = "pending";
      let paymentFailureReason: string | undefined = undefined;
      const fulfillmentStatus: "processing" | "shipped" | "delivered" | undefined = undefined;

      const combinedPhone = `${input.mpesaPhone ?? ""} ${input.address.phone}`;
      const notes = input.address.deliveryNotes?.toLowerCase() ?? "";

      if (combinedPhone.includes("000000") || notes.includes("test_failed")) {
        paymentStatus = "failed";
        paymentFailureReason = "The M-Pesa transaction was cancelled or declined by user.";
      } else if (combinedPhone.includes("111111") || notes.includes("test_expired")) {
        paymentStatus = "expired";
      } else if (combinedPhone.includes("222222") || notes.includes("test_pending")) {
        paymentStatus = "pending";
      } else {
        paymentStatus = "pending";
      }

      const order: Order = {
        id: orderId,
        reference,
        accessToken,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        address: input.address,
        email: input.email?.trim().toLowerCase(),
        paymentMethod: input.paymentMethod,
        paymentStatus,
        paymentFailureReason,
        fulfillmentStatus,
        reservationExpiresAt,
        chargeAttempts: 1,
        createdAt: now.toISOString(),
      };

      mockOrders.set(order.id, order);
      mockOrders.set(order.reference, order);
      return order;
    },

    async getOrder(reference: string, accessToken?: string): Promise<Order | null> {
      const order =
        mockOrders.get(reference) ??
        Array.from(mockOrders.values()).find((o) => o.id === reference || o.reference === reference);
      if (!order) return null;

      const combinedPhone = `${order.address.phone}`;
      const notes = order.address.deliveryNotes?.toLowerCase() ?? "";
      const isSpecialTest =
        combinedPhone.includes("000000") ||
        combinedPhone.includes("111111") ||
        combinedPhone.includes("222222") ||
        notes.includes("test_pending") ||
        notes.includes("test_failed") ||
        notes.includes("test_expired");

      if (order.paymentStatus === "pending") {
        if (order.reservationExpiresAt && new Date(order.reservationExpiresAt) < new Date()) {
          order.paymentStatus = "expired";
        } else if (!isSpecialTest) {
          order.paymentStatus = "paid";
          order.fulfillmentStatus = "processing";
        }
      }

      const isAuthorized = Boolean(
        accessToken &&
          (accessToken === order.accessToken ||
            accessToken === "tok_sample_token_8f3k9m2x7p" ||
            accessToken === "test_valid_token")
      );

      if (isAuthorized) {
        return { ...order };
      }

      return {
        ...order,
        accessToken: undefined,
        email: maskEmail(order.email),
        address: {
          fullName: "Customer",
          phone: "••••••••",
          county: order.address.county,
          estateOrLandmark: "••••••••",
          buildingOrHouse: "••••••••",
          deliveryNotes: undefined,
        },
      };
    },

    async resendMpesaPrompt(reference: string, accessToken: string): Promise<Order> {
      const order =
        mockOrders.get(reference) ??
        Array.from(mockOrders.values()).find((o) => o.id === reference || o.reference === reference);
      if (!order || (order.accessToken && order.accessToken !== accessToken)) {
        throw new Error("Order not found or invalid access token.");
      }
      if (order.paymentStatus === "paid") {
        throw new Error("Order has already been paid.");
      }
      if (order.paymentStatus === "expired") {
        throw new Error("Stock reservation expired. Please return to cart.");
      }
      const currentAttempts = order.chargeAttempts ?? 1;
      if (currentAttempts >= 3) {
        throw new Error("Maximum resend attempts reached.");
      }
      order.chargeAttempts = currentAttempts + 1;
      order.paymentStatus = "pending";
      order.paymentFailureReason = undefined;
      return { ...order };
    },

    async switchOrderToCard(
      reference: string,
      accessToken: string
    ): Promise<{ authorizationUrl: string; order: Order }> {
      const order =
        mockOrders.get(reference) ??
        Array.from(mockOrders.values()).find((o) => o.id === reference || o.reference === reference);
      if (!order || (order.accessToken && order.accessToken !== accessToken)) {
        throw new Error("Order not found or invalid access token.");
      }
      if (order.paymentStatus === "paid") {
        throw new Error("Order has already been paid.");
      }
      order.paymentMethod = "card";
      order.paymentStatus = "pending";
      const authorizationUrl = `/order/${order.reference}?token=${order.accessToken}&payment=card_simulated`;
      return { authorizationUrl, order: { ...order } };
    },

    async subscribeNewsletter(input: NewsletterInput): Promise<FormSubmitResult> {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const email = input.email?.trim() ?? "";
      if (!email || !emailRegex.test(email)) {
        return {
          success: false,
          message: "Please enter a valid email address.",
        };
      }
      return {
        success: true,
        message: "Thank you for subscribing! Check your inbox soon.",
      };
    },

    async subscribeToNewsletter(input: NewsletterSignup): Promise<void> {
      void input;
    },

    async submitContactForm(input: ContactInput): Promise<FormSubmitResult> {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const name = input.name?.trim() ?? "";
      const email = input.email?.trim() ?? "";
      const subject = input.subject?.trim() ?? "";
      const message = input.message?.trim() ?? "";

      if (name.length < 2) {
        return { success: false, message: "Please enter your name (at least 2 characters)." };
      }
      if (!email || !emailRegex.test(email)) {
        return { success: false, message: "Please enter a valid email address." };
      }
      if (subject.length < 2) {
        return { success: false, message: "Please enter a subject." };
      }
      if (message.length < 10) {
        return { success: false, message: "Message must be at least 10 characters." };
      }
      if (message.length > 1000) {
        return { success: false, message: "Message cannot exceed 1000 characters." };
      }

      return {
        success: true,
        message: "Thank you for reaching out! We will respond within 24 hours.",
      };
    },

    async sendContactMessage(input: ContactMessage): Promise<void> {
      void input;
    },

    async recordConsent(choice: ConsentChoice | ConsentRecord): Promise<void> {
      if (typeof choice.analytics !== "boolean") {
        throw new Error("Invalid consent payload");
      }
      mockConsentRecords.push(choice);
    },
    async trackEvent(event: AnalyticsEventInput): Promise<void> {
      if (!event || !event.event) {
        throw new Error("Invalid analytics event payload");
      }
      mockAnalyticsEvents.push(event);
    },
  };
}
