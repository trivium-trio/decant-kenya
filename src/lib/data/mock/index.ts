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

    async subscribeToNewsletter() {},
    async sendContactMessage() {},
    async recordConsent() {},
  };
}
