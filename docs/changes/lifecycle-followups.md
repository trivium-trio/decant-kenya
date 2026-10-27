# Milestone 8.1 Follow-up: Lifecycle Follow-ups Report

## Summary of Changes

Branch: `fix/lifecycle-followups`

This follow-up addresses lifecycle, customer email receipting, copy accuracy, contract restoration, and token safety requirements:

### 1. Checkout Email Requirement & Privacy Inventory
- **CheckoutInput Contract**: Added required `email: string` to `CheckoutInput` in `src/lib/data/types.ts`.
- **Validation & Normalization**:
  - In `src/app/checkout/actions.ts`: Validated with standard email regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`), trimmed, and lowercased before passing to `getShopApi().createOrder()`.
  - In `src/components/checkout/checkout-form.tsx`: Added state and real-time/submission validation for required email format with mobile-first touch targets and inline error messaging (`aria-invalid`, `aria-describedby`).
  - Added shadcn/ui-styled email input with `autoComplete="email"` and `inputMode="email"`.
- **Mock Storage & PII Masking**:
  - `src/lib/data/mock/index.ts`: `createOrder` stores trimmed, lowercased `email`.
  - `getOrder` masks email when unauthenticated (e.g. `a••••i@example.com`) and unmasks it when a valid access token (`?token=tok_...`) is provided.
- **Privacy Policy Inventory (FR-36)**:
  - Updated `/privacy` data collection inventory for "Checkout & Order Delivery":
    * **Fields**: "Full name, email address, phone number (+254 format), county, estate or landmark, building or house number, delivery notes"
    * **Purpose**: "Order fulfillment, courier dispatch, customer email for order receipt and payment processing (transactional only, not newsletter consent), and statutory financial accounting. (Contractual necessity, Sec 30(b))"

### 2. Copy Updates (Removal of SMS Promises, Email Receipts Only)
- **Order Page Privacy Card**:
  - Removed outdated mention of receipts sent via SMS.
  - Added confirmation sent to customer email: `"A confirmation and order receipt link was sent to your email (<order.email>)."` (rendered only when email is present, displaying masked or unmasked value according to token authorization).
- **Checkout Form**:
  - Replaced phone helper copy `"We will SMS dispatch updates to this number."` with `"Courier contact and call upon arrival."` to eliminate false SMS promises.
- **Order Page Delivery & Payment Security**:
  - Replaced `"SMS dispatch alert will be sent upon courier pickup."` with `"Email updates will be sent upon courier dispatch."`

### 3. Newsletter and Contact Findings & Method Restoration
- **Audit Findings**:
  - **Requirements**: `docs/requirements.md` requires both features:
    * **FR-33**: Contact page (implemented at `/contact` via `ContactForm`).
    * **FR-35**: Footer newsletter signup ("Newsletter signup placed in the footer, not as a popup", implemented in `Footer` via `NewsletterForm`).
  - **Active UI**: The storefront UI uses `subscribeNewsletter(input: NewsletterInput): Promise<FormSubmitResult>` and `submitContactForm(input: ContactInput): Promise<FormSubmitResult>`.
- **Restorations Made**:
  - Restored `NewsletterSignup` and `ContactMessage` types in `src/lib/data/types.ts`.
  - Restored `subscribeToNewsletter(input: NewsletterSignup): Promise<void>` and `sendContactMessage(input: ContactMessage): Promise<void>` on `ShopApi` in `src/lib/data/api.ts` and `src/lib/data/mock/index.ts`.

### 4. Token Safety Verification
- **Audit Confirmation**:
  - `accessToken` is only used for authorization in `getOrder(reference, accessToken)`, `resendMpesaPrompt(reference, accessToken)`, and `switchOrderToCard(reference, accessToken)`.
  - `accessToken` is strictly excluded from `track()` analytics payloads (`src/lib/analytics/track.ts`).
  - No `console.log` or error messages contain `accessToken`.
  - Unauthenticated requests to `/order/[id]` never leak `accessToken` in the DOM or response JSON.
- **Automated Test**:
  - Added Playwright test in `tests/payment-lifecycle.spec.ts` that monitors all browser console events during checkout and order landing, asserting no log contains `tok_` or the secret token, and verifying unauthenticated order HTML does not leak the token.

---

## Verification Results
- `npm run lint`: 0 errors, 0 warnings
- `npx tsc --noEmit`: 0 errors
- `npm run build`: Production build and Partial Prerendering compilation successful (36/36 static pages)
- `npx playwright test`: Passed
