# API Contract

**Source of truth:** the `ShopApi` interface in `src/lib/data/api.ts` and the types in `src/lib/data/types.ts`.
This document is derived from the running code, not from memory.
It is intended for the backend team to implement a real adapter that replaces the mock in `src/lib/data/mock/`.

---

## 1. Conventions

### 1.1 Money

All monetary values are in **minor units** (cents). The currency is always `"KES"` (Kenyan shilling, ISO 4217). One KES = 100 minor units.

```ts
interface Money {
  amount: number;   // e.g. 150000 = KES 1,500
  currency: string; // always "KES" for now
}
```

The frontend formats prices with `Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 })`. It never hardcodes a currency symbol. JSON-LD divides `amount` by 100 for the `schema.org/Offer` `price` field.

### 1.2 IDs and slugs

- Every entity has a stable `id` (opaque string, e.g. `"p1"`, `"s2"`, `"order_1729..."`) used for internal references and API calls.
- Products and discovery sets also have a URL-safe `slug` (e.g. `"sample-perfume-1"`, `"sample-set-2"`) used in routes. Slugs must be unique within their kind.
- The frontend resolves pages by slug (`getProduct(slug)`, `getSet(slug)`) and references cart lines and orders by id.

### 1.3 Pagination

All paginated responses use:

```ts
interface Paginated<T> {
  items: T[];     // the current page
  total: number;  // total matching items across all pages
  page: number;   // 1-indexed current page
  pageSize: number;
}
```

The frontend computes `totalPages = Math.ceil(total / pageSize)` and clamps the page. Default `pageSize` is 12 for the shop listing.

### 1.4 Sorting

```ts
type SortOption = "popular" | "price_asc" | "price_desc" | "name";
```

`"popular"` is the default and means server-defined order (e.g. best-selling, editorially ranked). The frontend does not sort client-side.

### 1.5 Proposed error format

> **Proposal — not yet implemented.** The mock adapter uses thrown `Error` objects. When the backend is built, we suggest a structured JSON error envelope:

```jsonc
{
  "error": {
    "code": "OUT_OF_STOCK",          // machine-readable
    "message": "Perfume 7 is sold out.", // human-readable, safe to display
    "field": "items[2].id",          // optional, for validation errors
    "details": []                    // optional, for multi-field errors
  }
}
```

HTTP status codes:

| Status | Meaning |
|--------|---------|
| 400 | Validation error (bad input, empty cart, invalid phone) |
| 404 | Product, set, or order not found |
| 409 | Conflict (stock changed between validate and checkout) |
| 422 | Unprocessable (e.g. set includes a sold-out item) |
| 429 | Rate limited |
| 500 | Server error |

The frontend currently catches thrown errors in Server Actions and displays `error.message` to the user.

---

## 2. ShopApi methods

### 2.1 `listProducts(query?: ProductQuery): Promise<Paginated<Product>>`

**Purpose:** Paginated, filtered, sorted product listing (FR-11, FR-12, FR-13, FR-14, FR-15).

**Input:**
```ts
interface ProductQuery {
  search?: string;       // free-text search on name and brand
  brands?: string[];     // exact-match filter (OR within, AND with other filters)
  families?: string[];   // exact-match filter (OR within, AND with other filters)
  inStockOnly?: boolean; // exclude out_of_stock when true
  sort?: SortOption;     // default "popular"
  page?: number;         // 1-indexed, default 1
  pageSize?: number;     // default 12
}
```

**Output:** `Paginated<Product>`. See section 3 for the `Product` type.

**Error cases:**
- Invalid page (≤ 0) → clamped to 1.
- Invalid pageSize (≤ 0) → defaults to 12.

**Freshness / caching:**
- Catalogue metadata (name, brand, description, notes, images, slug) changes rarely → cacheable with `"use cache"` and `cacheTag("products")`.
- **Stock status and price must be fresh.** If the backend caches listings, stock should be validated separately at cart time (`validateCart`).

**Callers:**
- `src/components/shop/shop-results.tsx` — the `/shop` page.
- `src/app/product/[slug]/page.tsx` `generateStaticParams` — build-time with `pageSize: 1000`.
- `src/app/sitemap.ts` — sitemap generation with `pageSize: 1000`.

---

### 2.2 `listFacets(): Promise<{ brands: string[]; families: string[] }>`

**Purpose:** Alphabetically sorted brand and family values for the filter sidebar/sheet (FR-12).

**Input:** None.

**Output:**
```ts
{ brands: string[]; families: string[] }
```

Both arrays are sorted with `localeCompare`. Only values present in the catalogue appear.

**Error cases:** None expected. Returns empty arrays if the catalogue is empty.

**Freshness / caching:** Changes only when products are added/removed. Cacheable with a long TTL, invalidated alongside the catalogue.

**Callers:**
- `src/components/shop/shop-results.tsx` — called in parallel with `listProducts`.

---

### 2.3 `getProduct(slug: string): Promise<Product | null>`

**Purpose:** Single product lookup by slug for the product detail page (FR-16, FR-17).

**Input:** `slug` — URL slug string.

**Output:** The `Product` or `null` if not found (the page calls `notFound()`).

**Error cases:**
- Unknown slug → returns `null` (not an error).

**Freshness / caching:** Catalogue fields are cacheable. **Stock status must be fresh** because the page shows "In stock", "Few left", or "Sold out" and enables/disables Add to cart.

**Callers:**
- `src/app/product/[slug]/page.tsx` — `generateMetadata` and `ProductPage`.

---

### 2.4 `getBestSellers(limit?: number): Promise<Product[]>`

**Purpose:** Landing page best-sellers row, showing only in-stock products (FR-8).

**Input:** `limit` — max items, defaults to 4.

**Output:** Array of up to `limit` in-stock `Product` objects. The backend decides the ranking.

**Error cases:** None expected.

**Freshness / caching:** Cacheable with moderate TTL. Out-of-stock products must be excluded (stock is a filter, not just a display flag here).

**Callers:**
- `src/components/landing/best-sellers.tsx` — the landing page.

---

### 2.5 `listRelatedProducts(productId: string, limit?: number): Promise<Product[]>`

**Purpose:** "Similar scents" section on the product detail page (FR-19).

**Input:**
- `productId` — the current product's id.
- `limit` — max results, defaults to 4.

**Output:** Array of up to `limit` in-stock `Product` objects. The mock matches on same scent family or same brand, excluding the current product and sold-out items. The backend may use a smarter algorithm.

**Error cases:**
- Unknown `productId` → returns empty array.

**Freshness / caching:** Cacheable alongside the product, but out-of-stock items must be excluded (stock check is live).

**Callers:**
- `src/app/product/[slug]/page.tsx` — called in parallel with `listReviews`.

---

### 2.6 `suggestProducts(query: string, limit?: number): Promise<SearchSuggestion[]>`

**Purpose:** Instant search suggestions dropdown as the user types (FR-14).

**Input:**
- `query` — search string, minimum 2 characters (the Server Action enforces this).
- `limit` — max results, defaults to 5.

**Output:**
```ts
interface SearchSuggestion {
  id: string;
  slug: string;
  name: string;
  brand: string;
  family: string;
  price: number;    // minor units (not Money, just the amount)
  inStock: boolean;
}
```

**Error cases:** Query < 2 chars → returns empty array (handled by the Server Action before calling).

**Freshness / caching:** Should be fast (< 200ms). Results can be briefly cached (seconds), but stock status matters for display.

**Callers:**
- `src/app/actions/search.ts` `getSearchSuggestionsAction` — debounced from `SearchForm` (180ms).

---

### 2.7 `listSets(): Promise<DiscoverySet[]>`

**Purpose:** All discovery sets for the sets listing page and the landing page section (FR-7, FR-21).

**Input:** None.

**Output:** Array of `DiscoverySet` objects. See section 3.

**Error cases:** None expected.

**Freshness / caching:** Cacheable. Sets rarely change.

**Callers:**
- `src/components/landing/discovery-sets.tsx` — landing page (sliced to 4).
- `src/app/sets/page.tsx` — sets listing.
- `src/app/sets/[slug]/page.tsx` — `generateStaticParams`.
- `src/app/sitemap.ts` — sitemap generation.

---

### 2.8 `getSet(slug: string): Promise<{ set: DiscoverySet; products: Product[] } | null>`

**Purpose:** Single set with its included products for the set detail page (FR-21).

**Input:** `slug` — URL slug string.

**Output:** `{ set, products }` or `null` if not found. `products` is the expanded list of `Product` objects for each id in `set.productIds`.

**Error cases:**
- Unknown slug → returns `null`.

**Freshness / caching:** Cacheable. Stock status of included products matters for set availability (a set with a sold-out product is unavailable).

**Callers:**
- `src/app/sets/[slug]/page.tsx` — `generateMetadata` and `SetPage`.

---

### 2.9 `listReviews(options?: { productId?: string; limit?: number }): Promise<Review[]>`

**Purpose:** Product reviews for the product detail page (FR-18) and general reviews for the landing page (FR-10).

**Input:**
- `productId` — optional, filters to reviews for a specific product.
- `limit` — optional, cap the number returned.

**Output:** Array of `Review` objects. See section 3.

**Error cases:** None expected.

**Freshness / caching:** Cacheable with moderate TTL. New reviews appear with a delay, which is acceptable.

**Callers:**
- `src/app/product/[slug]/page.tsx` — filtered by product id.
- `src/components/landing/reviews.tsx` — unfiltered, limited to 3.

---

### 2.10 `validateCart(lines: CartLine[]): Promise<ValidatedCart>`

**Purpose:** Server-side price and stock validation of the client cart (FR-23, FR-25, NFR-27).

**Input:**
```ts
interface CartLine {
  kind: "product" | "set";
  itemId: string;
  quantity: number; // 1–10, enforced by the Server Action
}
```

**Output:**
```ts
interface PricedCartLine extends CartLine {
  name: string;
  unitPrice: Money;
  available: boolean;
}

interface ValidatedCart {
  lines: PricedCartLine[];
  subtotal: Money;   // sum of available lines only
  issues: string[];  // human-readable problems
}
```

**Error cases (via issues array, not HTTP errors):**
- `"Item p99 no longer exists."` — product was deleted.
- `"[Perfume 7] is sold out."` — product stock is `out_of_stock`.
- `"[Set name 3] includes a sold-out item."` — any product in the set is `out_of_stock`.

**Freshness / caching:** **Must be live.** This is the stock-truth checkpoint before checkout. Never cache.

**Callers:**
- `src/app/cart/actions.ts` `validateCartAction` — called by the cart page and checkout page on mount.

---

### 2.11 `createOrder(input: CheckoutInput): Promise<Order>`

**Purpose:** Place an order (FR-27, FR-28, FR-29, FR-30, FR-37, FR-38).

**Input:**
```ts
interface CheckoutInput {
  items: { id: string; kind: "product" | "set"; quantity: number }[];
  address: KenyaDeliveryAddress;
  paymentMethod: "mpesa" | "card";
  mpesaPhone?: string; // +254 format, required when paymentMethod is "mpesa"
}

interface KenyaDeliveryAddress {
  fullName: string;
  phone: string;            // +254 format, validated and normalized
  county: string;           // from KENYA_COUNTIES list
  estateOrLandmark: string;
  buildingOrHouse: string;
  deliveryNotes?: string;   // max 200 chars
}
```

The Server Action in `src/app/checkout/actions.ts` validates all fields before calling `createOrder`:
- `fullName` ≥ 2 chars.
- `phone` valid Kenyan format (0712..., +254712..., 254712...).
- `county`, `estateOrLandmark`, `buildingOrHouse` non-empty.
- `deliveryNotes` ≤ 200 chars.
- `mpesaPhone` valid Kenyan format when `paymentMethod` is `"mpesa"`.

**Output:**
```ts
interface Order {
  id: string;
  reference: string;       // human-readable, e.g. "DK-123456"
  items: OrderItem[];
  subtotal: number;        // minor units
  deliveryFee: number;     // minor units (mock: fixed 30000 = KES 300)
  total: number;           // subtotal + deliveryFee
  address: KenyaDeliveryAddress;
  paymentMethod: "mpesa" | "card";
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;       // ISO 8601
}

interface OrderItem {
  id: string;
  name: string;
  brand?: string;
  kind: "product" | "set";
  quantity: number;
  unitPrice: number;       // minor units
  totalPrice: number;      // unitPrice × quantity, minor units
}
```

**Error cases (thrown):**
- `"Product p7 is out of stock or unavailable."` — stock changed between validation and order.
- `"Discovery set [Set name 3] includes a sold-out fragrance."` — a product in the set went OOS.
- `"Your cart is empty."` — empty items array.

**Freshness / caching:** **Must be live.** Creates state. Never cache.

**Callers:**
- `src/app/checkout/actions.ts` `createOrderAction`.

---

### 2.12 `getOrder(id: string): Promise<Order | null>`

**Purpose:** Order confirmation page (FR-30). Lookup by order id or reference.

**Input:** `id` — order id or reference string.

**Output:** `Order` or `null`.

**Error cases:** Unknown id → returns `null` (page shows 404).

**Freshness / caching:** Order data is immutable after creation (except `paymentStatus` for async payment flows). Cache briefly if needed, but `paymentStatus` should reflect real-time state for M-Pesa polling.

**Callers:**
- `src/app/order/[id]/page.tsx`.

---

### 2.13 `subscribeNewsletter(input: NewsletterInput): Promise<FormSubmitResult>`

**Purpose:** Footer newsletter signup (FR-35, FR-36).

**Input:**
```ts
interface NewsletterInput {
  email: string;
}
```

**Output:**
```ts
interface FormSubmitResult {
  success: boolean;
  message: string; // displayed to the user
}
```

**Error cases (via `success: false`):**
- `"Please enter a valid email address."` — invalid format.

**Freshness / caching:** Mutating. Never cache.

**Callers:**
- `src/app/actions/newsletter.ts` `subscribeNewsletterAction`.

---

### 2.14 `submitContactForm(input: ContactInput): Promise<FormSubmitResult>`

**Purpose:** Contact page form submission (FR-33, FR-36).

**Input:**
```ts
interface ContactInput {
  name: string;       // min 2 chars
  email: string;      // valid email
  phone?: string;     // optional, +254 format if provided
  subject: string;    // min 2 chars
  message: string;    // 10–1000 chars
}
```

**Output:** `FormSubmitResult`.

**Error cases (via `success: false`):**
- `"Please enter your name (at least 2 characters)."` — name too short.
- `"Please enter a valid email address."` — invalid email.
- `"Please enter a subject."` — subject too short.
- `"Message must be at least 10 characters."` — message too short.
- `"Message cannot exceed 1000 characters."` — message too long.

**Freshness / caching:** Mutating. Never cache.

**Callers:**
- `src/app/contact/actions.ts` `submitContactAction`.

---

### 2.15 `recordConsent(choice: ConsentChoice | ConsentRecord): Promise<void>`

**Purpose:** Record the visitor's Kenya DPA consent preference on the server (NFR-25, NFR-31, FR-36).

**Input:**
```ts
interface ConsentChoice {
  analytics: boolean;   // true = "analytics_granted", false = "essential_only"
  updatedAt: string;    // ISO 8601
}
```

**Output:** `void` on success.

**Error cases (thrown):**
- `"Invalid consent payload"` — `analytics` is not a boolean.

**Freshness / caching:** Mutating. Never cache.

**Callers:**
- `src/app/actions/analytics.ts` `recordConsentAction` — called from the consent zustand store on user choice.

---

### 2.16 `trackEvent(event: AnalyticsEventInput): Promise<void>`

**Purpose:** Record anonymized funnel analytics events, gated by user consent (NFR-31, FR-36).

**Input:**
```ts
type AnalyticsEventName =
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_completed";

interface AnalyticsEventInput {
  event: AnalyticsEventName;
  itemKind?: "product" | "set";
  itemId?: string;
  value?: number;       // order total in minor units, for checkout_completed
  currency?: "KES";
}
```

**Output:** `void` on success.

**Error cases (thrown):**
- `"Invalid analytics event payload"` — missing `event` field.

**Freshness / caching:** Mutating. Never cache. Failures are silently swallowed on the client (analytics must never crash the user experience).

**Callers:**
- `src/app/actions/analytics.ts` `trackEventAction` — called from `src/lib/analytics/track.ts`, which checks consent before firing.

**Funnel events fired by the frontend:**

| Event | Trigger location | Fields sent |
|-------|-----------------|-------------|
| `product_view` | `/product/[slug]` via `TrackProductView` | `itemKind: "product"`, `itemId` |
| `product_view` | `/sets/[slug]` via `TrackProductView` | `itemKind: "set"`, `itemId` |
| `add_to_cart` | `AddToCartButton` click | `itemKind`, `itemId` |
| `checkout_started` | `CheckoutForm` mount | _(no item fields)_ |
| `checkout_completed` | `CheckoutForm` after successful `createOrder` | `itemId: orderId`, `value`, `currency: "KES"` |

---

### 2.17 Legacy / duplicate methods

The following methods exist on the `ShopApi` interface but are **not actively used** by any page or Server Action. They appear to be earlier drafts superseded by `subscribeNewsletter` and `submitContactForm`:

- `subscribeToNewsletter(input: NewsletterSignup): Promise<void>` — no-op in mock.
- `sendContactMessage(input: ContactMessage): Promise<void>` — no-op in mock.

These should be removed when the backend adapter is built.

---

## 3. Shared types

### Product

```ts
interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  notes: ScentNotes;           // { top: string[], heart: string[], base: string[] }
  family?: string;             // e.g. "Woody", "Fresh", "Floral", "Amber"
  images: Media[];             // { src, alt, width, height }
  price: Money;                // 10ml decant price
  stock: StockStatus;          // "in_stock" | "low_stock" | "out_of_stock"
  fullBottleSlug?: string;     // later phase (FR-20)
  rating?: { average: number; count: number }; // optional pre-computed
}
```

### DiscoverySet

```ts
interface DiscoverySet {
  id: string;
  slug: string;
  name: string;
  description: string;
  productIds: string[];   // references to Product.id
  price: Money;
  image: Media;
}
```

### Review

```ts
interface Review {
  id: string;
  productId?: string;
  author: string;
  rating: number;        // 1–5
  body: string;
  createdAt: string;     // ISO 8601
}
```

### StockStatus

```ts
type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
```

The frontend maps these to display labels: "In stock", "Few left", "Sold out". JSON-LD maps them to `schema.org/InStock`, `schema.org/LimitedAvailability`, `schema.org/OutOfStock`.

### Media

```ts
interface Media {
  src: string;    // URL or path
  alt: string;
  width: number;
  height: number;
}
```

---

## 4. Data-collection endpoints (FR-36 inventory)

Tied to the privacy page data-collection inventory and the Kenya DPA 2019.

| Feature | Fields collected | ShopApi method | Purpose | Retention |
|---------|-----------------|----------------|---------|-----------|
| Checkout & order delivery | Full name, phone (+254), county, estate/landmark, building/house, delivery notes | `createOrder` | Order fulfillment, courier dispatch, customer communication, statutory tax records (Sec 30(b)) | 7 years (Kenya tax) |
| M-Pesa payment (STK Push) | Safaricom phone (+254) | `createOrder` (`mpesaPhone` field) | Triggering STK Push and validating transaction (Sec 30(b)) | 7 years (financial) |
| Customer support contact | Name, email, phone (optional), subject, message | `submitContactForm` | Responding to queries and post-purchase support (Legitimate interest / Consent) | 1 year after resolution |
| Footer newsletter signup | Email address | `subscribeNewsletter` | New arrival notifications, restock alerts, fragrance guides (Consent, Sec 32) | Until unsubscribe |
| Funnel analytics | Event name, item ID, item kind, value (KES) | `trackEvent` | Measuring catalogue discovery and checkout funnels (Consent, Sec 32) | 90 days aggregated, no PII |
| Privacy & consent preferences | Consent choices, timestamp | `recordConsent` | Respecting customer data preferences (Kenya DPA compliance) | 1 year from selection |

The frontend only fires analytics events when the user has explicitly granted consent (`analytics_granted`) via the DPA consent banner. Essential cookies (cart persistence via `localStorage`) do not require consent.

---

## 5. Suggested REST mapping

> **These are suggestions.** The backend may use GraphQL, tRPC, or any protocol. The frontend only calls `ShopApi` methods through Server Actions, so the URL shape is the backend team's choice.

| ShopApi method | HTTP | Suggested path | Notes |
|---------------|------|---------------|-------|
| `listProducts` | GET | `/api/products` | Query params: `q`, `brand` (repeated), `family` (repeated), `inStock`, `sort`, `page`, `pageSize` |
| `listFacets` | GET | `/api/products/facets` | Returns `{ brands, families }` |
| `getProduct` | GET | `/api/products/:slug` | 404 if not found |
| `getBestSellers` | GET | `/api/products/best-sellers?limit=4` | Only in-stock |
| `listRelatedProducts` | GET | `/api/products/:id/related?limit=4` | Only in-stock, excludes self |
| `suggestProducts` | GET | `/api/products/suggest?q=...&limit=5` | Fast, < 200ms |
| `listSets` | GET | `/api/sets` | |
| `getSet` | GET | `/api/sets/:slug` | Returns `{ set, products }`, 404 if not found |
| `listReviews` | GET | `/api/reviews?productId=...&limit=...` | Both params optional |
| `validateCart` | POST | `/api/cart/validate` | Body: `{ lines: CartLine[] }` |
| `createOrder` | POST | `/api/orders` | Body: `CheckoutInput` |
| `getOrder` | GET | `/api/orders/:id` | Lookup by id or reference |
| `subscribeNewsletter` | POST | `/api/newsletter` | Body: `{ email }` |
| `submitContactForm` | POST | `/api/contact` | Body: `ContactInput` |
| `recordConsent` | POST | `/api/consent` | Body: `ConsentChoice` |
| `trackEvent` | POST | `/api/events` | Body: `AnalyticsEventInput`, fire-and-forget |

### Authentication note

The frontend currently has no authentication or user accounts. All endpoints are public. If accounts are added (FR-32), order lookup and order creation will need auth headers. Newsletter, contact, consent, and analytics endpoints should remain unauthenticated.

---

## 6. Open questions for the backend decision

### 6.1 Stock freshness and reservation

The frontend calls `validateCart` on the cart page and before checkout to check stock. But there is no stock reservation between validation and `createOrder`. A product could sell out between those two calls.

- Should `createOrder` re-validate stock atomically (double-check)?
- Should there be a time-limited stock reservation (e.g. 10 minutes) when checkout starts?
- How is `low_stock` determined? Is there a threshold (e.g. ≤ 3 units)?

### 6.2 Cart: server or client?

The cart currently lives entirely on the client in `localStorage` (zustand persist, key `"decant-cart"`). The server only knows about cart contents when `validateCart` or `createOrder` is called.

- Is this acceptable for launch, or should the cart be server-side (e.g. for cross-device sync, abuse prevention)?
- If server-side, should there be `POST /api/cart`, `PATCH /api/cart/lines/:id`, etc.?
- A server cart would also enable server-side stock checks on every page load.

### 6.3 Checkout and M-Pesa STK Push states the UI must show

The frontend currently models `paymentStatus: "paid" | "pending" | "failed"` on the `Order` type, and the mock sets it to `"paid"` immediately. In production with M-Pesa STK Push (the primary payment method in Kenya), the UI must explicitly represent and handle 5 core states:

1. **Waiting state**: The STK Push prompt has been sent to Safaricom; the UI shows an active spinner/modal ("Check your phone for the M-Pesa prompt and enter your PIN…") and begins listening/polling for payment status.
2. **Success state**: Safaricom confirms receipt of payment; the UI marks the order as paid, clears the cart, and redirects to `/order/:id` with confirmation.
3. **Failure state**: The user cancels the prompt, enters an incorrect PIN, or has insufficient funds; the UI displays a clear, actionable error message.
4. **Timeout state**: The user does not interact with the prompt within Safaricom's ~60-second window; the UI transitions out of the waiting state and alerts the user that the request timed out.
5. **Retry state**: The UI provides a single-tap "Retry M-Pesa prompt" button to re-trigger the STK push to the same phone number or edit the number without losing order form details or re-entering address data.

Questions for the backend decision:
- How does the frontend receive payment status changes? Polling `GET /api/orders/:id`, Server-Sent Events (SSE), or WebSockets?
- Should `createOrder` return immediately with `paymentStatus: "pending"` so the client manages the waiting loop, or does an asynchronous payment intent endpoint exist?
- Should `paymentStatus` include additional statuses such as `"expired"`, `"cancelled"`, or `"timed_out"`?
- What idempotency keys are used when triggering a retry to avoid duplicate charges?

### 6.4 Delivery options and fees

The mock uses a fixed delivery fee of KES 300 (`30000` minor units). In production:

- What delivery options are available (e.g. standard, express, CBD pickup)?
- Are fees county-dependent?
- Should there be a `listDeliveryOptions(county: string): Promise<DeliveryOption[]>` method?
- Are there free-delivery thresholds?
- The `Order` type has a single `deliveryFee` field. Should it also carry the delivery method name and estimated delivery date?

### 6.5 Accounts and order history

The frontend has a placeholder `/account` route disallowed in `robots.txt` but no pages built for it (FR-32 is "To confirm").

- Guest checkout only at launch, or accounts?
- If accounts: email/password, social login, or phone-based OTP (common in Kenya)?
- Order history: `listOrders(): Promise<Order[]>` for authenticated users?
- Wishlists or saved-for-later?

### 6.6 Rate limiting

The frontend makes unauthenticated POST calls for newsletter, contact, consent, and analytics. Without rate limiting:

- Newsletter and contact endpoints are abuse targets (spam, enumeration).
- Analytics events could be flooded.
- Suggested: rate limit by IP, with tighter limits on form submissions (e.g. 5/minute) and looser limits on analytics (e.g. 100/minute).

### 6.7 CORS and sessions

- The frontend currently uses Server Actions (same-origin POST to Next.js). If the backend is a separate service, CORS headers are needed.
- Are sessions needed, or is the API entirely stateless (cart on client, no auth)?
- If M-Pesa requires a payment session ID, how is it tied to the order?

### 6.8 Content source for reviews and static pages

- Where do reviews come from? Manually entered, imported from a third party, or user-submitted?
- Should reviews be writable from the frontend (`createReview`)? If so, moderation flow?
- Static page content (FAQ, how-it-works, shipping): hardcoded in the frontend currently. Should it come from a CMS?

### 6.9 Image hosting

- Product images are currently local placeholders (`/placeholder-vial.svg`). In production, where are images hosted?
- Should `Media.src` be a full URL to a CDN, or a path that Next.js `next/image` can optimize?
- Are there multiple images per product (the type supports `images: Media[]`)?

### 6.10 Full-bottle phase (FR-20)

The `Product` type has `fullBottleSlug?: string` reserved for a later phase. When this phase starts:

- Is the full bottle a separate `Product` with its own id and slug, or a variant of the same product?
- Does the data model need a `variants` array, or is the current one-to-one link sufficient?
- Should `getProduct` return the linked full-bottle product inline?

### 6.11 Search implementation

`suggestProducts` and `listProducts` with `search` both do text matching. In the mock, this is a simple `includes` on name, brand, and family.

- Should the backend use full-text search (e.g. Elasticsearch, pg_trgm)?
- Should search support fuzzy matching, stemming, or Swahili terms?
- Is there a need for search analytics (what people search for)?

### 6.12 Webhook and event infrastructure

The frontend fires analytics events via `trackEvent` and records consent via `recordConsent`. These are fire-and-forget POSTs.

- Should these go to a dedicated analytics service (e.g. PostHog, Mixpanel) or a custom backend table?
- Are there other events the backend needs to push to the frontend (e.g. order status changes, flash sales)?
- Is there a need for WebSocket or SSE for real-time updates?
