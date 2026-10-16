import type { ShopApi } from "../api";
import type { Money, PricedCartLine, Product, ProductQuery } from "../types";
import { products, reviews, sets } from "./data";

const sorters: Record<NonNullable<ProductQuery["sort"]>, (a: Product, b: Product) => number> = {
  popular: () => 0,
  price_asc: (a, b) => a.price.amount - b.price.amount,
  price_desc: (a, b) => b.price.amount - a.price.amount,
  name: (a, b) => a.name.localeCompare(b.name),
};

export function createMockApi(): ShopApi {
  return {
    async listProducts(query = {}) {
      const { search, brand, family, inStockOnly, sort = "popular", page = 1, pageSize = 12 } = query;
      const q = search?.trim().toLowerCase();
      const filtered = products
        .filter(
          (p) =>
            (!q || `${p.brand} ${p.name}`.toLowerCase().includes(q)) &&
            (!brand || p.brand === brand) &&
            (!family || p.family === family) &&
            (!inStockOnly || p.stock !== "out_of_stock"),
        )
        .sort(sorters[sort]);
      const start = (page - 1) * pageSize;
      return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, pageSize };
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

    async subscribeToNewsletter() {},
    async sendContactMessage() {},
    async recordConsent() {},
  };
}
