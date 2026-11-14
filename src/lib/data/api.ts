import { createMockApi } from "./mock";
import { createRemoteApi } from "./remote";
import type {
  AnalyticsEventInput,
  CartLine,
  CheckoutInput,
  ConsentChoice,
  ConsentRecord,
  ContactInput,
  DiscoverySet,
  FormSubmitResult,
  NewsletterInput,
  Order,
  Paginated,
  Product,
  ProductQuery,
  Review,
  SearchSuggestion,
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
  /** Most recently added in-stock products. */
  getNewArrivals(limit?: number): Promise<Product[]>;
  listRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
  suggestProducts(query: string, limit?: number): Promise<SearchSuggestion[]>;
  listSets(): Promise<DiscoverySet[]>;
  getSet(slug: string): Promise<{ set: DiscoverySet; products: Product[] } | null>;
  listReviews(options?: { productId?: string; limit?: number }): Promise<Review[]>;
  validateCart(lines: CartLine[]): Promise<ValidatedCart>;
  createOrder(input: CheckoutInput): Promise<Order>;
  getOrder(reference: string, accessToken?: string): Promise<Order | null>;
  resendMpesaPrompt(reference: string, accessToken: string): Promise<Order>;
  switchOrderToCard(reference: string, accessToken: string): Promise<{ authorizationUrl: string; order: Order }>;
  subscribeNewsletter(input: NewsletterInput): Promise<FormSubmitResult>;
  submitContactForm(input: ContactInput): Promise<FormSubmitResult>;
  recordConsent(choice: ConsentChoice | ConsentRecord): Promise<void>;
  trackEvent(event: AnalyticsEventInput): Promise<void>;
  // TODO: delivery options and payment session webhooks once the backend and payment provider are decided.
}

let instance: ShopApi | undefined;

export function getShopApi(): ShopApi {
  if (!instance) {
    const provider =
      process.env.SHOP_API_PROVIDER ??
      process.env.API_MODE ??
      "mock";

    if (provider === "remote") {
      instance = createRemoteApi();
    } else if (provider === "mock") {
      instance = createMockApi();
    } else {
      throw new Error(
        `Unknown API provider "${provider}". Supported providers: "remote", "mock".`
      );
    }
  }
  return instance;
}
