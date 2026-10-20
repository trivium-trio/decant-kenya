import type { ShopApi } from "../api";
import type {
  CheckoutInput,
  ContactInput,
  FormSubmitResult,
  Money,
  NewsletterInput,
  Order,
  OrderItem,
  PricedCartLine,
  Product,
  ProductQuery,
} from "../types";
import { products, reviews, sets } from "./data";

const defaultSampleOrder: Order = {
  id: "sample-order-1",
  reference: "DK-100001",
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
  paymentMethod: "mpesa",
  paymentStatus: "paid",
  createdAt: "2026-10-20T12:00:00.000Z",
};

const mockOrders = new Map<string, Order>([
  ["sample-order-1", defaultSampleOrder],
  ["DK-100001", defaultSampleOrder],
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

      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const orderId = `order_${Date.now()}_${randomDigits}`;
      const reference = `DK-${randomDigits}`;

      const order: Order = {
        id: orderId,
        reference,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        address: input.address,
        paymentMethod: input.paymentMethod,
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
      };

      mockOrders.set(order.id, order);
      mockOrders.set(order.reference, order);
      return order;
    },

    async getOrder(id: string): Promise<Order | null> {
      return mockOrders.get(id) ?? null;
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

    async subscribeToNewsletter() {},
    async sendContactMessage() {},
    async recordConsent() {},
  };
}
