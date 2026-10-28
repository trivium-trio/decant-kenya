# Milestone 8.1 Follow-up: Lifecycle Follow-ups Report

## Summary of Changes

Branch: `fix/lifecycle-followups`  
Pull Request: [#7](https://github.com/trivium-trio/decant-kenya/pull/7)

---

### 1. Forms Contract: Canonical Single Set
- **Audit Findings**:
  - The UI (`src/components/newsletter/newsletter-form.tsx` and `src/components/contact/contact-form.tsx`) talks to Server Actions (`subscribeNewsletterAction` and `submitContactAction`), which in turn call:
    * `getShopApi().subscribeNewsletter(input: NewsletterInput): Promise<FormSubmitResult>`
    * `getShopApi().submitContactForm(input: ContactInput): Promise<FormSubmitResult>`
  - The previously restored signatures `subscribeToNewsletter(input: NewsletterSignup): Promise<void>` and `sendContactMessage(input: ContactMessage): Promise<void>` were dead/duplicate definitions from an early draft that did not provide feedback or error states to UI components.
- **Action Taken**:
  - Completely deleted `NewsletterSignup`, `ContactMessage`, `subscribeToNewsletter`, and `sendContactMessage` from `src/lib/data/types.ts`, `src/lib/data/api.ts`, and `src/lib/data/mock/index.ts`.
  - Retained the **single canonical set** in `ShopApi`:
    ```ts
    subscribeNewsletter(input: NewsletterInput): Promise<FormSubmitResult>;
    submitContactForm(input: ContactInput): Promise<FormSubmitResult>;
    ```
  - Input & output shapes:
    ```ts
    export interface NewsletterInput {
      email: string;
    }

    export interface ContactInput {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    }

    export interface FormSubmitResult {
      success: boolean;
      message: string;
    }
    ```

---

### 2. Zero PII / Email Reveal on Unauthorized Orders
- **Contract Enforcement**:
  - In `src/lib/data/mock/index.ts`, `getOrder(reference, accessToken)` now sets `email: undefined` when `!isAuthorized` (completely removing the masked `"a••••i@example.com"`).
  - Without a valid token, only the county is revealed (`address.county`). `fullName` defaults to `"Customer"`, and phone/estate/building are masked to `"••••••••"`, with `deliveryNotes: undefined`.
- **Order Page Copy**:
  - In `src/app/order/[id]/page.tsx`, the Protected Customer Details card copy now states:
    > "Customer name, phone number, and street address are hidden to protect privacy. A confirmation was sent to the email you provided."
  - No email string, masked fragment, or `@` is displayed in unauthenticated responses.
  - The full email address is displayed exclusively when a valid access token (`?token=tok_...`) is supplied.

---

### 3. Copy Location: "Email updates will be sent upon courier dispatch"
- The exact location where this string appears in the codebase is:
  - **File**: [`src/app/order/[id]/page.tsx`](file:///home/elvin/Documents/git/decant_kenya/src/app/order/[id]/page.tsx#L316)
  - **Line**: Line 316 (under the Payment Method & Security section `<section aria-labelledby="payment-info-heading">`).
- Context:
  ```tsx
  <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
    <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
    <span>Email updates will be sent upon courier dispatch.</span>
  </div>
  ```

---

### 4. Order Security Headers & URL / Query Safety
- **Headers Configured on `/order/:path*`**:
  - Configured in `next.config.ts`:
    ```ts
    {
      source: "/order/:path*",
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Cache-Control", value: "private, no-store" },
      ],
    }
    ```
  - `Referrer-Policy: no-referrer` prevents the browser from transmitting the `?token=tok_...` query parameter in the `Referer` header to external domains.
  - `Cache-Control: private, no-store` prevents intermediate proxies, edge caches, or shared caches from caching sensitive order data or tokenized URLs.
- **Analytics & Error Reporters URL Query Audit**:
  - **Vercel Analytics (`@vercel/analytics`)**:
    * Strips URL query parameters by default in page view tracking.
    * If integrated in the future, `<Analytics beforeSend={(event) => { const url = new URL(event.url); url.search = ''; return { ...event, url: url.toString() }; }} />` should be configured to ensure search params are stripped before dispatch.
  - **Vercel Speed Insights (`@vercel/speed-insights`)**:
    * Groups Web Vitals performance data strictly by App Router route segments (`/order/[id]`) and does not store query strings.
  - **Error Reporters (e.g. Sentry)**:
    * Unhandled exceptions capture `window.location.href` by default. If Sentry is added, `beforeSend(event)` must scrub `event.request.url` or drop `token` query parameters.
  - **Current Storefront Architecture**:
    * There are **no third-party tracking scripts, no Vercel Analytics, and no external error reporters** installed (in strict adherence to project rules).
    * Storefront analytics is handled locally via `src/lib/analytics/track.ts` and `src/app/actions/analytics.ts`, which sends only structured payloads (`event`, `itemId`, `itemKind`, `value`, `currency`) and never reads or passes URL query strings or `accessToken`.
- **Automated Tests**:
  - Added test in `tests/payment-lifecycle.spec.ts` asserting that responses to `/order/*` serve `Referrer-Policy: no-referrer` and `Cache-Control: no-store`.

---

### 5. Email Validation: Sub-addressing & Multi-part Domains
- **Validator**: Added [`validateEmail(email: string)`](file:///home/elvin/Documents/git/decant_kenya/src/lib/checkout/validation.ts#L93-L120) to `src/lib/checkout/validation.ts`.
- **Supported Formats**:
  - Sub-addressing / plus-tags: `name+tag@example.co.ke`
  - Multi-part ccTLDs: `.co.ke`, `.ac.ke`, `.org.ke`, `.com`
  - Standard RFC 5322 pattern: `/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/`
- **Application**:
  - Client-side: Used in `CheckoutForm` (`src/components/checkout/checkout-form.tsx`).
  - Server-side: Used in `createOrderAction` (`src/app/checkout/actions.ts`).
- **Automated Tests**:
  - Added dedicated test in `tests/payment-lifecycle.spec.ts` placing an order with `name+tag@example.co.ke` and asserting that the tagged address is accepted and displayed on the confirmation page.

---

## Verification Results
- `npm run lint`: **0 errors, 0 warnings**
- `npx tsc --noEmit`: **0 errors**
- `npm run build`: **Compiled successfully** (36/36 static pages)
- `npx playwright test tests/payment-lifecycle.spec.ts`: **27/27 passed**
- `npx playwright test tests/checkout.spec.ts`: **18/18 passed**
