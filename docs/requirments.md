# Frontend Requirements Analysis: Decant Shop

Version 1.0 · Approved · October 15, 2026

## 1. Purpose and scope

This document defines what the storefront frontend must do and how well it must do it. The frontend and backend are being decoupled, so everything here is written against a clear boundary: the frontend owns presentation, interaction and performance; the backend owns data, inventory, orders and payments.

**In scope:** the customer-facing storefront (all pages, components, states, responsive behavior, accessibility, performance, SEO) and the contract it needs from a backend.

**Out of scope:** backend design and the commerce platform choice (to be decided at the next meeting), admin dashboard, inventory logic, payment processing internals, fulfilment and CRM follow-ups.

Each item is marked **Confirmed** (stated by the client or the team), **Approved** (proposed by us and approved in review) or **To confirm** (open question, still unresolved). Version 1.0 incorporates the reviewer's comments.

## 2. Project context

The client is launching a fragrance shop that starts with **decants and samples** and plans to grow into **full bottles** once customers love a sample. The commercial journey the site must support is **Try it first, Love it, Own it**.

Competitor review (Scents With Chris, Syntlure, The Scent Plug, Thapelo Smells, Penhaligon's) and the client's own feedback produced three design concerns. These are the founding requirements:

- **No white backgrounds:** they look cheap and harsh.
- **Responsiveness and speed:** most competitors load slowly (The Scent Plug is the exception).
- **Minimalism:** most competitor landing pages have too much going on.

Useful patterns found in the competitors: discovery sets (Thapelo Smells), a fragrance profiling quiz and gifting help (Penhaligon's), compact authenticity messaging (Scents With Chris) and paginated catalogues with small images (The Scent Plug).

## 3. Confirmed decisions

- **Palette:** Night Vetiver. Ground #0E1613, surface #16211C, text #E6EAE2, accent #A8B98A, muted #8FA08F.
- **Product format:** decants are sold in **10ml bottles only**. One size per perfume, so there is no size selector.
- **Approach:** mobile-first (bottom-up). Build the phone view first, then scale up to tablet and large screens.
- **Priorities:** responsiveness and quality.
- **Architecture:** frontend and backend are decoupled.
- **Design direction:** minimal, dark, no white backgrounds. Wireframe and palette boards exist on the design canvas.
- **Components:** shadcn/ui.
- **Interface:** no carousels anywhere on the site, at the client's request.

## 4. Users and key journeys

**User types**

- **First-time visitor** who is unsure what to buy and wants a low-risk way to try a scent.
- **Returning customer** who knows what they want and wants to reorder quickly.
- **Curious browser** who explores by brand, notes or mood and may graduate to a full bottle later.

**Core journeys (all must work one-handed on a phone)**

1. Land, understand the offer in one screen, open a discovery set, add to cart, check out.
2. Find a specific perfume (browse or search), view its page, add a 10ml decant to cart, check out.
3. Return after trying a decant and find the full bottle option (later phase).

## 5. Functional requirements

Priority uses MoSCoW: Must, Should, Could. All items are approved (v1.0) unless marked **To confirm**.

### 5.1 Global layout and navigation

- **FR-1 · Must** Sticky, compact header with logo, menu and cart count. On mobile the links collapse into a hamburger menu button, labeled Menu, that opens a full-screen or drawer menu.
- **FR-2 · Must** Footer with shipping, returns, privacy, terms and contact links.
- **FR-3 · Must** Cart icon shows live item count and opens the cart.
- **FR-4 · Should** Persistent search entry point in the header.
- **FR-5 · Must** No carousels (the client does not want them), intrusive popups or blocking overlays.

### 5.2 Landing page

One hero, three or four discovery sets, one best-sellers row (in-stock items only), a Try, Love, Own strip, an authenticity line with three reviews, and a slim footer.

- **FR-6 · Must** Hero: one headline, one sentence, one primary button (shop discovery sets) and one secondary text link. Usability requirements in 7.11 apply.
- **FR-7 · Must** Discovery sets section with 3 or 4 set cards (image, name, contents summary, price), laid out as a grid that stacks on phones. No carousel.
- **FR-8 · Must** Best-sellers row showing only in-stock products, each with a 10ml decant label, price and Add to cart.
- **FR-9 · Must** Try, Love, Own strip explaining the model in three short steps.
- **FR-10 · Must** Authenticity message and three static reviews. No auto-advancing review carousel.

### 5.3 Catalogue and search

- **FR-11 · Must** Product listing page with a responsive grid (2 columns on phones) and pagination or Show more.
- **FR-12 · Should** Filters: brand, scent family or notes, availability. Filters open in a bottom sheet on mobile.
- **FR-13 · Should** Sorting (for example popularity, price).
- **FR-14 · Should** Search with instant suggestions and a clear no-results state.
- **FR-15 · Must** Out-of-stock items are clearly marked and excluded from featured sections.

### 5.4 Product detail page

- **FR-16 · Must** Image area (vial photo, brand bottle where permitted), name, brand, price, 10ml decant label and Add to cart.
- **FR-17 · Must** Scent description and notes (top, heart, base) in readable, scannable blocks.
- **FR-18 · Should** Reviews and rating summary for the product.
- **FR-19 · Could** Related or similar scents.
- **FR-20 · Could** Later phase: a Loved it? Get the full bottle prompt linking to the full-bottle product. The layout and data model must leave room for it.

### 5.5 Discovery sets

- **FR-21 · Must** Sets listing and set detail pages showing the contents (which decants), price and Add to cart.
- **FR-22 · Could** Fragrance quiz or guided picker that recommends a set (inspired by Penhaligon's). To confirm with the client.

### 5.6 Cart

- **FR-23 · Must** Add, remove and change quantity. Show line totals and subtotal.
- **FR-24 · Must** Cart persists across reloads and visits on the same device.
- **FR-25 · Must** Handles stock changes gracefully (item sold out or limited) with a clear message.
- **FR-26 · Should** Mini-cart drawer after adding an item, with a path to checkout.

### 5.7 Checkout and order confirmation

The exact steps depend on the backend and payment provider, but the frontend must provide:

- **FR-27 · Must** Guest checkout with contact details, delivery address, delivery method and order summary.
- **FR-28 · Must** Payment step that never handles raw card data in our code (hosted fields or provider redirect).
- **FR-29 · Must** Inline validation, clear error messages, and protection against double submission.
- **FR-30 · Must** Order confirmation page with order number and summary.
- **FR-31 · Should** Order status or tracking page. To confirm.
- **FR-32 · Could** Customer accounts and order history. To confirm.

### 5.8 Content and support pages

- **FR-33 · Must** How it works, Shipping and returns, FAQ, Contact, Privacy policy, Terms.
- **FR-34 · Must** Custom 404 and error pages that lead back to shopping.
- **FR-35 · Could** Newsletter signup placed in the footer, not as a popup.
- **FR-36 · Must** Data-collection inventory: every form and tracking event (newsletter signup, contact form, consent choice, analytics events) is documented with the fields it collects, the backend endpoint it calls and its purpose. The privacy and cookie policy pages describe exactly that.

## 6. Page and route inventory

- **/** Landing page
- **/shop** Product listing, with filters and search
- **/product/[slug]** Product detail
- **/sets** and **/sets/[slug]** Discovery sets and set detail
- **/cart** Cart
- **/checkout** and **/order/[id]** Checkout and confirmation
- **/how-it-works**, **/shipping-returns**, **/faq**, **/contact**, **/privacy**, **/terms** Content pages
- **/account** Accounts (to confirm)
- 404 and error pages

## 7. Non-functional requirements

### 7.1 Performance targets

- **NFR-1** Core Web Vitals in the Good range on key pages, measured on a mid-range phone over 4G: LCP at or under 2.5 s, INP at or under 200 ms, CLS at or under 0.1.
- **NFR-2** Lighthouse mobile performance score of 90 or more on the landing, listing and product pages.
- **NFR-3** Pages are rendered on the server or statically, so meaningful content is in the first HTML response. The framework must support server-side rendering or static generation; Next.js is the chosen framework.
- **NFR-4** Images in AVIF or WebP with responsive sizes, lazy-loaded below the fold, the hero image prioritized, and fixed aspect ratios to prevent layout shift.
- **NFR-5** Fonts self-hosted, at most two families and a few weights, with a fallback stack.
- **NFR-6** Initial JavaScript kept under an agreed budget (starting point: 170 KB compressed per page). Third-party scripts are deferred and justified one by one.
- **NFR-7** Large catalogues paginated. No loading the full catalogue on one page.

### 7.2 Responsiveness (mobile-first)

- **NFR-8** Design and build at 360 to 390 px first, then scale up through 640, 768, 1024 and 1280 px (the default Tailwind breakpoints).
- **NFR-9** No horizontal scrolling from 320 px to 1920 px. Wide content scrolls inside its own container.
- **NFR-10** Touch targets at least 44 by 44 px (the WCAG AA minimum is 24 px; we choose the larger standard for thumb use).
- **NFR-11** Layouts are fluid. Components adapt to their container, not just to device widths.
- **NFR-12** Safe-area insets respected on phones with notches and system bars.

### 7.3 Accessibility

- **NFR-13** WCAG 2.2 AA as the target for all pages.
- **NFR-14** Text and interactive contrast of at least 4.5:1 against the Night Vetiver surfaces, verified in the build, since muted text on dark surfaces is the likeliest failure.
- **NFR-15** Full keyboard support, visible focus states, semantic landmarks and labels, alt text for product images.
- **NFR-16** Respect reduced-motion settings. Motion is limited to subtle, purposeful transitions.

### 7.4 Visual and brand quality

- **NFR-17** Night Vetiver tokens defined once (colors, type scale, spacing, radii) and used everywhere. No pure white backgrounds.
- **NFR-18** The accent color is reserved for primary actions such as Add to cart and the main call to action.
- **NFR-19** Product photography follows one consistent treatment (same backdrop and framing). Own vial photos are preferred over supplier images, because white-background bottle shots look like pasted boxes on a dark page.
- **NFR-20** Minimalism rule: one clear purpose per section, and nothing on the landing page that does not serve the Try, Love, Own journey.

### 7.5 SEO and discoverability

- **NFR-21** Server-rendered pages with unique titles and descriptions, clean URLs, a sitemap.xml and a robots.txt file.
- **NFR-22** Per-page custom meta tags (title, description, canonical URL), social sharing metadata, and JSON-LD structured data (Product and Offer on product pages, plus Organization and BreadcrumbList). Review markup only when real reviews are shown on the page. Cart, checkout and account pages are noindex. These help search engines understand and display the site but do not guarantee ranking.

### 7.6 Security and privacy

- **NFR-23** HTTPS only. No secrets in client code. Strict content security policy.
- **NFR-24** Card data never touches our frontend. Use the provider's hosted components.
- **NFR-25** Cookie and analytics consent handled as required for the client's market. To confirm.

### 7.7 Reliability and resilience

- **NFR-26** Every data-driven view has loading, empty, error and offline-ish states. Failed API calls never leave a blank screen.
- **NFR-27** Optimistic cart updates with rollback on failure.

### 7.8 Maintainability and quality

- **NFR-28** Strict TypeScript, linting and formatting enforced in CI.
- **NFR-29** A shared component library built from design tokens, with each component documented and tested at phone and desktop widths.
- **NFR-30** Automated checks in CI: unit tests, end-to-end tests at mobile viewport, accessibility checks and Lighthouse budgets.

### 7.9 Browser and device support

- Latest two versions of Chrome, Safari (iOS and macOS), Firefox, Edge and Samsung Internet. Test on at least one low-end Android phone and one iPhone.

### 7.10 Analytics

- **NFR-31** Lightweight, privacy-friendly analytics covering the funnel: product views, add to cart, checkout started and completed, and set versus single-decant conversion.

### 7.11 Usability (HCI), new in v1.0, for review

- **NFR-32** The primary call to action is visible without scrolling on a 360 by 640 px phone.
- **NFR-33** One primary action per screen. Secondary actions are visually quieter.
- **NFR-34** Key actions sit within easy thumb reach. Product pages on mobile have a sticky Add to cart bar.
- **NFR-35** Every tap gives immediate visible feedback (a state change within 100 ms), and add to cart is confirmed.
- **NFR-36** Navigation, buttons and forms follow the same patterns on every page.
- **NFR-37** The three core journeys are tested with at least five real users on phones before launch, and critical issues are fixed.

## 8. Frontend stack (approved)

Approved in review. It is chosen to serve the stated priorities of speed, responsiveness and quality.

- **Framework:** Next.js (App Router) with TypeScript, for server rendering, image optimization and font handling.
- **Styling:** Tailwind CSS, whose unprefixed classes are the mobile styles and whose breakpoints add larger screens. Night Vetiver lives in the theme as tokens.
- **Components:** shadcn/ui on Radix primitives, for accessible building blocks whose code we own. MUI was considered and not chosen.
- **State:** a small persisted store (for example Zustand) for the cart. Server components for catalogue data.
- **Hosting:** Vercel, or any platform with a CDN and preview deployments.
- **Quality tooling:** ESLint, Prettier, Playwright, axe and Lighthouse CI.

## 9. The frontend and backend contract

Because the backend is undecided, the frontend talks to it only through a typed data layer. We build against typed mock data first, then swap in the real API without touching the UI.

**Capabilities the frontend needs from any backend**

- **Catalogue:** products, discovery sets, filters, search, stock status, pagination.
- **Cart:** create, read, update and remove lines, with price and stock validation.
- **Checkout:** delivery options and rates, order creation, payment session.
- **Orders:** confirmation data, and status if tracking is in scope.
- **Content:** reviews and static page content. Source to confirm.
- **Forms and marketing:** newsletter signup and contact form submission.
- **Consent and analytics:** storing the visitor's consent choice and receiving analytics events.

**Core data shapes**

- **Product:** id, slug, brand, name, scent notes, description, images, price for the 10ml decant, stock status, and an optional link to a full-bottle product for later.
- **Discovery set:** id, name, description, included products, price, image.
- **Cart line:** product or set id, quantity, unit price, availability.
- **Order:** id, lines, totals, delivery details, payment state.

Because every decant is 10ml, each perfume has one sellable variant, which keeps these shapes simple. How stock is tracked behind the scenes (for example from bottle volume) is a backend concern.

## 10. Delivery approach: mobile-first, bottom-up

1. **Foundation:** repository, tooling, CI, design tokens, fonts, base layout and the typed data layer with mock data.
2. **Mobile (360 to 390 px):** core components, then landing, listing, product, set, cart and checkout screens.
3. **Tablet (768 px):** adapt layouts and navigation, add multi-column grids.
4. **Desktop (1024 px and up):** wider grids, richer filters, refined spacing and image sizes.
5. **Hardening:** accessibility audit, performance tuning against the budgets, cross-browser and device testing.

**Definition of done for every component:** works from 320 to 1920 px, has loading, empty and error states, meets contrast and keyboard requirements, uses design tokens only, and has tests at phone and desktop widths.

## 11. Acceptance criteria

- Performance targets in NFR-1 and NFR-2 are met on the key pages.
- No critical or serious issues in an accessibility audit. Manual keyboard and screen reader pass on the main journeys.
- All three core journeys complete on a phone with one hand, without horizontal scrolling.
- Landing page contains only the sections listed in 5.2.
- The UI runs against both mock data and the real backend with no code changes outside the data layer.

## 12. Assumptions, risks and open questions

**Open questions (To confirm)**

- Backend and commerce approach: custom build or an existing platform. Next meeting.
- Target market, currency and languages, which drive payment providers, delivery options, tax display and consent rules.
- Payment provider and delivery methods.
- Guest checkout only, or accounts as well?
- Who manages products, sets, prices and reviews, and where do reviews come from?
- Product photography: who supplies vial photos, and do we have transparent cutouts of brand bottles?
- Brand assets: name, logo, final typeface, tone of voice.
- Whether the quiz or guided picker is in the first release.
- Timing of the full-bottle phase.

**Risks**

- **Contract drift** between frontend and backend teams. Mitigation: a typed contract, mock data and shared examples.
- **Dark theme contrast and photo treatment** can look poor with inconsistent images. Mitigation: one photo style, contrast checks in CI.
- **Performance creep** from third-party scripts, large images and added features. Mitigation: budgets enforced in CI.
- **Scope creep against the minimalism goal.** Mitigation: every new section must justify itself against the Try, Love, Own journey.

## 13. Next steps

- Answer the open questions in section 12 as they are settled.
- Settle the backend approach at the next meeting, then finalize section 9.
- Start the foundation phase now: repository, tooling, design tokens and the typed data layer with mock data.