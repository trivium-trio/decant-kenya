import { createMockApi } from "./mock";
import type {
  CartLine,
  CheckoutInput,
  ConsentRecord,
  ContactMessage,
  DiscoverySet,
  NewsletterSignup,
  Order,
  Paginated,
  Product,
  ProductQuery,
  Review,
  ValidatedCart,
} from "./types";

/**
 * The contract between the storefront and any backend (section 9 of the requirements).
 * The UI only ever talks to this interface. Swap the adapter, never the UI.
 */
export interface ShopApi {
  listProducts(query?: ProductQuery): Promise<Paginated<Product>>;
  listFacets(): Promise<{ brands: string[]; families: string[] }>;
  getProduct(slug: string): Promise<Product | null>;
  /** In-stock products only (FR-8). */
  getBestSellers(limit?: number): Promise<Product[]>;
  listSets(): Promise<DiscoverySet[]>;
  getSet(slug: string): Promise<{ set: DiscoverySet; products: Product[] } | null>;
  listReviews(options?: { productId?: string; limit?: number }): Promise<Review[]>;
  validateCart(lines: CartLine[]): Promise<ValidatedCart>;
  createOrder(input: CheckoutInput): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  subscribeToNewsletter(input: NewsletterSignup): Promise<void>;
  sendContactMessage(input: ContactMessage): Promise<void>;
  recordConsent(input: ConsentRecord): Promise<void>;
  // TODO: delivery options and payment session webhooks once the backend and payment provider are decided.
}

let instance: ShopApi | undefined;

export function getShopApi(): ShopApi {
  if (!instance) {
    const mode = process.env.API_MODE ?? "mock";
    if (mode !== "mock") {
      throw new Error(`API_MODE "${mode}" has no adapter yet. Add one in src/lib/data/ and register it here.`);
    }
    instance = createMockApi();
  }
  return instance;
}
