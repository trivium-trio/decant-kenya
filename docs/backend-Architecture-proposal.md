# Backend &amp; Payment Architecture Proposal: Decant Kenya

**Version 1.0 · Proposed for Team Sign-Off · October 21, 2026** **Companion Document to:** `docs/requirements.md` (Frontend Requirements Analysis v1.0) and `docs/api-contract.md`

\-------------------------------------------------------------------------------- 

### 1\. Purpose and Scope

This proposal formally establishes the backend, Content Management System (CMS), and payment gateway architecture for **Decant Kenya**. It is designed to resolve the unresolved architectural questions recorded in **Section 9** and **Section 12** of `docs/requirements.md`.

The storefront (`trivium-trio/decant-kenya`) is decoupled and communicates with the backend exclusively through the typed `ShopApi` contract (`src/lib/data/api.ts`). This proposal outlines the dedicated backend service (`trivium-trio/decant-kenya-backend`) that will replace the mock adapter (`src/lib/data/mock/`) with production services without requiring any modifications to customer-facing UI components.

\-------------------------------------------------------------------------------- 

### 2\. Architectural Decision Summary

| Layer                        | Chosen Technology                                 | Rationale &amp; Fit for Decant Kenya                                                                                                                                               |
| ---------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Backend &amp; Headless CMS**   | **Payload CMS v3.0** (Next.js Native, TypeScript) | Code-first schema definitions in TypeScript matching `src/lib/data/types.ts` 1:1, preventing contract drift. Automatically generates an admin dashboard for client operations. |
| **Database**                 | **PostgreSQL** (via Neon Serverless or Supabase)  | ACID compliance, transactional integrity for stock decrements and orders, zero-cost starter tier.                                                                              |
| **Media Storage**            | **Cloudflare R2 / Supabase Storage**              | S3-compatible asset storage for transparent bottle/vial cutouts with automated WebP/AVIF transformations (NFR-4, NFR-19).                                                      |
| **Payment Gateway**          | **Paystack Kenya**                                | Unified API for Safaricom M-Pesa STK Push (FR-37) and Cards (FR-28, NFR-24) using minor currency units (cents), full CBK regulatory compliance, and rapid merchant onboarding. |
| **Hosting &amp; Infrastructure** | **Vercel / Node Serverless**                      | Serverless execution matching the frontend deployment pipeline at zero fixed monthly operational overhead.                                                                     |

\-------------------------------------------------------------------------------- 

### 3\. CMS Evaluation &amp; Selection Rationale

Modern e-commerce web applications generally leverage one of four patterns:

1. **Headless Commerce Engines (e.g., Medusa.js, Vendure):** Powerful for multi-variant size/color matrices, complex multi-region tax regimes, and split-warehouse fulfillment. However, for a catalogue where every perfume is exclusively sold as a 10ml decant (a single sellable variant) and discovery sets are fixed 3-decant bundles, Medusa introduces unnecessary database models, cache infrastructure (Redis), and dual-dashboard administrative overhead for a 2-developer team.
2. **SaaS Platforms (e.g., Shopify Headless):** Industry standard, but Shopify's Storefront API mandates redirection to a hosted checkout (unless using enterprise Shopify Plus), which conflicts directly with the custom Night Vetiver M-Pesa STK Push waiting modal built for `/checkout`.
3. **Traditional Monoliths (e.g., WooCommerce as Headless):** Introduces PHP maintenance, slower API response times, and schema friction for custom concepts like top/heart/base scent notes.
4. **Code-First Headless CMS (Payload CMS v3.0) — Recommended:**
  * **Single Admin Dashboard:** The merchant can manage perfumes, scent pyramids, discovery set relationships, customer reviews, master bottle stock, and customer orders in one place.
  * **Zero Type Drift:** Defining collections in TypeScript auto-generates schema types that map directly to the frontend `types.ts`.
  * **Native Integration with Next.js 16 Cache Components:** Payload's `afterChange` hooks trigger targeted on-demand revalidations (`revalidateTag("catalogue")`), preserving sub-2.5s LCP on 4G networks (NFR-1).

\-------------------------------------------------------------------------------- 

### 4\. Data Models &amp; Payload Collections (Fulfilling Section 9 &amp; API Contract)

#### 4.1 Collection: `products`

* `id`: string (UUID or stable slug-compatible ID).
* `slug`: string (unique, indexed).
* `name`: string.
* `brand`: relationship to `brands` collection or select option.
* `family`: select option (`Woody`, `Fresh`, `Floral`, `Amber`).
* `description`: text.
* `notes`: group containing:
  * `top`: array of strings.
  * `heart`: array of strings.
  * `base`: array of strings.
* `price`: integer (minor units in KES, e.g., `150000` \= KES 1,500).
* `images`: array of upload relationships (Media).
* `isBestSeller`: boolean (FR-8).
* `masterBottleStockMl`: integer (e.g., 100 ml).
* `decantStockCount`: integer (available 10ml vials).
* `inStock`: boolean (auto-computed; false when decantStockCount &lt;= 0).
* `fullBottleProductId`: optional relationship to `products` (reserved for Phase 2, FR-20).

#### 4.2 Collection: `discovery-sets`

* `id`: string.
* `slug`: string (unique, indexed).
* `name`: string.
* `description`: text.
* `price`: integer (minor units in KES, e.g., `400000` \= KES 4,000).
* `includedProducts`: relationship array to `products` (validated to exactly 3 items).
* `image`: upload relationship (Media).
* `inStock`: boolean (computed true only if all 3 linked products are inStock).

#### 4.3 Collection: `reviews`

* `id`: string.
* `product`: relationship to `products` (optional for general reviews).
* `authorName`: string.
* `rating`: integer (1 to 5).
* `comment`: text.
* `isFeaturedOnLanding`: boolean (FR-10).
* `status`: select (`pending`, `approved`). Only approved reviews are served to the frontend.

#### 4.4 Collection: `orders`

* `id`: string.
* `reference`: string (e.g., `DK-100234`, indexed).
* `items`: array of line items (`itemId`, `kind`, `name`, `brand`, `quantity`, `unitPrice`, `totalPrice`).
* `subtotal`: integer (KES minor units).
* `deliveryFee`: integer (default `30000` \= KES 300).
* `total`: integer (KES minor units).
* `address`: group containing `fullName`, `phone`, `county`, `estateOrLandmark`, `buildingOrHouse`, `deliveryNotes`.
* `paymentMethod`: select (`mpesa`, `card`).
* `paymentStatus`: select (`pending`, `paid`, `failed`).
* `paystackReference`: string (indexed for webhook resolution).
* `fulfillmentStatus`: select (`received`, `decanting`, `dispatched`, `delivered`).

#### 4.5 Collections: Marketing, Support &amp; Compliance (FR-35, FR-36, NFR-25, NFR-31)

* `newsletter-subscribers`: `email` (unique), `subscribedAt`, `consentVersion`.
* `contact-submissions`: `name`, `email`, `phone`, `subject`, `message`, `status`.
* `consent-logs`: `analyticsGranted` (boolean), `timestamp`, `ipHash` (anonymous DPA audit).
* `analytics-events`: funnel event logs (`product_view`, `add_to_cart`, `checkout_started`, `checkout_completed`).

\-------------------------------------------------------------------------------- 

### 5\. Payment Gateway Integration: Paystack Kenya

#### 5.1 Architecture Overview

Paystack Kenya serves as the consolidated payment service provider under CBK licensing:

* **M-Pesa STK Push (FR-37):** Direct charge API triggering real-time phone prompts.
* **Credit/Debit Cards (FR-28, NFR-24):** Hosted PCI-DSS redirect ensuring zero card data or external script injection on the storefront.
* **Minor Unit Consistency:** Natively operates in minor units (cents), matching the `AGENTS.md` rules and preventing floating-point calculation errors.

#### 5.2 Transaction Lifecycle

1. **Checkout Submission:** The customer submits the validated delivery address and payment choice on `/checkout`.
2. **Order Creation:** Next.js Server Action calls the backend endpoint `POST /api/orders`. The order is recorded with `paymentStatus: "pending"`.
3. **STK Push Dispatch:** The backend triggers Paystack's Charge API:
  * Target: `https://api.paystack.co/charge`
  * Body: `{ "amount": total, "currency": "KES", "mobile_money": { "phone": mpesaPhone, "provider": "mpesa" }, "metadata": { "orderReference": reference } }`
4. **Waiting State:** The storefront enters the polling waiting loop, showing the active STK Push status modal.
5. **Webhook Settlement:** Paystack delivers an HMAC SHA-512 signed `charge.success` webhook payload to `POST /api/webhooks/paystack`. The backend:
  * Updates `paymentStatus` to `"paid"`.
  * Atomically decrements `decantStockCount` (or subtracts 10ml from `masterBottleStockMl`).
  * Triggers revalidation for catalogue caches if inventory drops to zero.
6. **Order Resolution:** Storefront polling detects the `"paid"` status and redirects the user to `/order/[id]`.

\-------------------------------------------------------------------------------- 

### 6\. Caching, Invalidation &amp; Edge Performance (NFR-1, NFR-3)

* **Cache Boundaries:** Public reads (`getProducts`, `getSet`, `listFacets`) are wrapped in Next.js 16 Cache Components (`"use cache"`) tagged with `cacheTag("catalogue")`.
* **Stock Live Validation:** `validateCart` and `createOrder` bypass edge caches, executing direct database reads to eliminate overselling risk.
* **Webhook Revalidation:** The backend dispatches a secure request to the storefront's `/api/revalidate` route upon product modification or stock depletion, keeping cached pages fast and synchronized.

\-------------------------------------------------------------------------------- 

### 7\. Resolution of Section 12 Open Questions

| Question from `docs/requirements.md` (v1.0) | Approved Resolution                                                                           |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Backend &amp; commerce approach**             | Payload CMS v3.0 + PostgreSQL in repository `trivium-trio/decant-kenya-backend`.              |
| **Payment provider**                        | Paystack Kenya (supporting M-Pesa STK Push and Cards).                                        |
| **Delivery methods &amp; rates**                | Flat-rate nationwide courier delivery at KES 300.                                             |
| **Catalogue &amp; review management**           | Managed by store administrators via the Payload CMS Admin panel.                              |
| **User accounts**                           | Guest checkout only for v1.0 (FR-27); account features deferred to Phase 2 (FR-32).           |
| **Full bottle transition (FR-20)**          | Deferred to Phase 2\. Data model contains the placeholder relationship `fullBottleProductId`. |

\-------------------------------------------------------------------------------- 

### 8\. Implementation Steps for the 2-Developer Team

1. **Frontend Repository (** **decant-kenya** **):**
  * Implement the live HTTP client adapter in `src/lib/data/remote/index.ts` conforming to `ShopApi`.
  * Add environment variable toggle `SHOP_API_PROVIDER="remote" | "mock"`.
2. **Backend Repository (** **decant-kenya-backend** **):**
  * Scaffold Payload CMS v3 with PostgreSQL connection strings.
  * Implement schemas for products, sets, reviews, orders, marketing, and compliance.
  * Configure Paystack webhook endpoint and HMAC verification.