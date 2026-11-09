import type { ShopApi } from "../api";
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
} from "../types";

function getBackendUrl(): string {
  const url =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "http://localhost:5000";
  return url.replace(/\/+$/, "");
}

async function getForwardedHeaders(includeClientIp = false): Promise<Record<string, string>> {
  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  const storefrontKey = process.env.STOREFRONT_API_KEY?.trim();
  if (storefrontKey) {
    reqHeaders["X-Storefront-Key"] = storefrontKey;
  }

  if (includeClientIp) {
    try {
      const { headers } = await import("next/headers");
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    const realIp = h.get("x-real-ip");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : realIp;
    if (clientIp) {
      reqHeaders["X-Client-IP"] = clientIp;
    }
    } catch {
      // Outside active request context (static generation, build, test runner)
    }
  }

  return reqHeaders;
}

async function handleResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    let errorMessage = fallbackMessage;
    try {
      const errorJson = await res.json();
      if (errorJson && typeof errorJson === "object" && "error" in errorJson) {
        const err = errorJson.error as { message?: string };
        if (err?.message) {
          errorMessage = err.message;
        }
      }
    } catch {
      // Ignore JSON parse failure on error responses
    }
    throw new Error(errorMessage);
  }
  return (await res.json()) as T;
}

export function createRemoteApi(): ShopApi {
  const baseUrl = getBackendUrl();

  return {
    async listProducts(query?: ProductQuery): Promise<Paginated<Product>> {
      const fetchPage = async (page: number, pageSize?: number): Promise<Paginated<Product>> => {
        const params = new URLSearchParams();
        if (query?.search?.trim()) params.set("search", query.search.trim());
        if (query?.sort) params.set("sort", query.sort);
        if (page) params.set("page", String(page));
        if (pageSize) params.set("pageSize", String(pageSize));
        if (query?.inStockOnly !== undefined) params.set("inStockOnly", String(query.inStockOnly));

        if (query?.brands && query.brands.length > 0) {
          for (const brand of query.brands) {
            params.append("brands", brand);
          }
        }

        if (query?.families && query.families.length > 0) {
          for (const family of query.families) {
            params.append("families", family);
          }
        }

        const queryString = params.toString();
        const url = `${baseUrl}/api/shop/products${queryString ? `?${queryString}` : ""}`;
        const headers = await getForwardedHeaders();

        const res = await fetch(url, {
          headers,
          next: {
            tags: ["catalogue"],
            revalidate: 3600,
          },
        });

        return handleResponse<Paginated<Product>>(res, "Failed to retrieve products from backend.");
      };

      const requestedPageSize = query?.pageSize;
      // Backend max allowed pageSize is 100. If not specified or <= 100, fetch normally.
      if (typeof requestedPageSize !== "number" || requestedPageSize <= 100) {
        return fetchPage(query?.page ?? 1, requestedPageSize);
      }

      // If caller requested more than 100 items (e.g. 1000 for static params or sitemap),
      // fetch pages of 100 sequentially until all items are collected, with a safety cap.
      const targetLimit: number = requestedPageSize;
      const BACKEND_MAX_PAGE_SIZE = 100;
      const MAX_SAFETY_PAGES = 50; // Safety cap (up to 5,000 items) to prevent infinite loops

      const firstPage = await fetchPage(1, BACKEND_MAX_PAGE_SIZE);
      const allItems: Product[] = [...firstPage.items];
      const total = firstPage.total;

      const totalPages = Math.min(
        Math.ceil(total / BACKEND_MAX_PAGE_SIZE),
        MAX_SAFETY_PAGES
      );

      for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
        if (allItems.length >= total || allItems.length >= targetLimit) {
          break;
        }
        const nextPage = await fetchPage(currentPage, BACKEND_MAX_PAGE_SIZE);
        if (!nextPage.items || nextPage.items.length === 0) {
          break;
        }
        allItems.push(...nextPage.items);
      }

      return {
        items: allItems.slice(0, targetLimit),
        total,
        page: 1,
        pageSize: allItems.length,
      };
    },

    async listFacets(): Promise<{ brands: string[]; families: string[] }> {
      const url = `${baseUrl}/api/shop/facets`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        next: {
          tags: ["catalogue"],
          revalidate: 3600,
        },
      });

      return handleResponse<{ brands: string[]; families: string[] }>(
        res,
        "Failed to retrieve facets from backend."
      );
    },

    async getProduct(slug: string): Promise<Product | null> {
      const trimmedSlug = (slug || "").trim();
      if (!trimmedSlug) return null;

      const url = `${baseUrl}/api/shop/products/${encodeURIComponent(trimmedSlug)}`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        next: {
          tags: ["catalogue"],
          revalidate: 3600,
        },
      });

      if (res.status === 404) {
        return null;
      }

      return handleResponse<Product>(res, `Failed to retrieve product "${trimmedSlug}".`);
    },

    async getBestSellers(limit = 4): Promise<Product[]> {
      const url = `${baseUrl}/api/shop/bestsellers?limit=${encodeURIComponent(limit)}`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        next: {
          tags: ["catalogue"],
          revalidate: 3600,
        },
      });

      return handleResponse<Product[]>(res, "Failed to retrieve best sellers.");
    },

    async listRelatedProducts(productIdOrSlug: string, limit = 4): Promise<Product[]> {
      const trimmed = (productIdOrSlug || "").trim();
      if (!trimmed) return [];

      const url = `${baseUrl}/api/shop/products/${encodeURIComponent(trimmed)}/related?limit=${encodeURIComponent(limit)}`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        next: {
          tags: ["catalogue"],
          revalidate: 3600,
        },
      });

      return handleResponse<Product[]>(res, "Failed to retrieve related products.");
    },

    async suggestProducts(query: string, limit = 5): Promise<SearchSuggestion[]> {
      const trimmed = (query || "").trim();
      if (trimmed.length < 2) return [];

      const url = `${baseUrl}/api/shop/suggestions?q=${encodeURIComponent(trimmed)}&limit=${encodeURIComponent(limit)}`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        cache: "no-store",
      });

      return handleResponse<SearchSuggestion[]>(res, "Failed to retrieve suggestions.");
    },

    async listSets(): Promise<DiscoverySet[]> {
      const url = `${baseUrl}/api/shop/sets`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        next: {
          tags: ["catalogue"],
          revalidate: 3600,
        },
      });

      return handleResponse<DiscoverySet[]>(res, "Failed to retrieve discovery sets.");
    },

    async getSet(slug: string): Promise<{ set: DiscoverySet; products: Product[] } | null> {
      const trimmed = (slug || "").trim();
      if (!trimmed) return null;

      const url = `${baseUrl}/api/shop/sets/${encodeURIComponent(trimmed)}`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        next: {
          tags: ["catalogue"],
          revalidate: 3600,
        },
      });

      if (res.status === 404) {
        return null;
      }

      return handleResponse<{ set: DiscoverySet; products: Product[] }>(
        res,
        `Failed to retrieve discovery set "${trimmed}".`
      );
    },

    async listReviews(options?: { productId?: string; limit?: number }): Promise<Review[]> {
      const params = new URLSearchParams();
      if (options?.productId) params.set("productId", options.productId.trim());
      if (options?.limit) params.set("limit", String(options.limit));

      const queryString = params.toString();
      const url = `${baseUrl}/api/shop/reviews${queryString ? `?${queryString}` : ""}`;
      const headers = await getForwardedHeaders();

      const res = await fetch(url, {
        headers,
        next: {
          tags: ["reviews", "catalogue"],
          revalidate: 3600,
        },
      });

      return handleResponse<Review[]>(res, "Failed to retrieve reviews.");
    },

    async validateCart(lines: CartLine[]): Promise<ValidatedCart> {
      const url = `${baseUrl}/api/shop/cart/validate`;
      const headers = await getForwardedHeaders(true);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lines }),
        cache: "no-store",
      });

      return handleResponse<ValidatedCart>(res, "Cart validation failed.");
    },

    async createOrder(input: CheckoutInput): Promise<Order> {
      const url = `${baseUrl}/api/shop/orders`;
      const headers = await getForwardedHeaders(true);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        cache: "no-store",
      });

      return handleResponse<Order>(res, "Failed to create order.");
    },

    async getOrder(reference: string, accessToken?: string): Promise<Order | null> {
      const trimmedRef = (reference || "").trim();
      if (!trimmedRef) return null;

      const url = `${baseUrl}/api/shop/orders/${encodeURIComponent(trimmedRef)}`;
      const headers = await getForwardedHeaders(true);

      if (accessToken?.trim()) {
        headers["x-order-token"] = accessToken.trim();
      }

      const res = await fetch(url, {
        headers,
        cache: "no-store",
      });

      if (res.status === 404) {
        return null;
      }

      return handleResponse<Order>(res, `Failed to retrieve order ${trimmedRef}.`);
    },

    async resendMpesaPrompt(reference: string, accessToken: string): Promise<Order> {
      const trimmedRef = (reference || "").trim();
      const url = `${baseUrl}/api/shop/orders/${encodeURIComponent(trimmedRef)}/resend-mpesa`;
      const headers = await getForwardedHeaders(true);

      if (accessToken?.trim()) {
        headers["x-order-token"] = accessToken.trim();
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        cache: "no-store",
      });

      return handleResponse<Order>(res, "Failed to resend M-Pesa prompt.");
    },

    async switchOrderToCard(
      reference: string,
      accessToken: string
    ): Promise<{ authorizationUrl: string; order: Order }> {
      const trimmedRef = (reference || "").trim();
      const url = `${baseUrl}/api/shop/orders/${encodeURIComponent(trimmedRef)}/switch-to-card`;
      const headers = await getForwardedHeaders(true);

      if (accessToken?.trim()) {
        headers["x-order-token"] = accessToken.trim();
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        cache: "no-store",
      });

      return handleResponse<{ authorizationUrl: string; order: Order }>(
        res,
        "Failed to switch order payment method to card."
      );
    },

    async subscribeNewsletter(input: NewsletterInput): Promise<FormSubmitResult> {
      const url = `${baseUrl}/api/shop/newsletter`;
      const headers = await getForwardedHeaders(true);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: input.email }),
        cache: "no-store",
      });

      return handleResponse<FormSubmitResult>(res, "Failed to subscribe to newsletter.");
    },

    async submitContactForm(input: ContactInput): Promise<FormSubmitResult> {
      const url = `${baseUrl}/api/shop/contact`;
      const headers = await getForwardedHeaders(true);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        cache: "no-store",
      });

      return handleResponse<FormSubmitResult>(res, "Failed to submit contact form.");
    },

    async recordConsent(choice: ConsentChoice | ConsentRecord): Promise<void> {
      const url = `${baseUrl}/api/shop/consent`;
      const headers = await getForwardedHeaders(true);

      await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(choice),
        cache: "no-store",
      });
    },

    async trackEvent(event: AnalyticsEventInput): Promise<void> {
      const url = `${baseUrl}/api/shop/analytics`;
      const headers = await getForwardedHeaders(true);

      await fetch(url, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
        cache: "no-store",
      });
    },
  };
}
