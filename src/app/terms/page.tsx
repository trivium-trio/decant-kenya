import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ShieldAlert } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service, independent decanter intellectual property disclaimer, and legal jurisdiction in Kenya.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <section>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-primary">
          <Scale className="size-3.5" />
          Legal Agreement
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Please review these terms governing your purchase of authentic fragrance decants and discovery sets on our platform.
        </p>
      </section>

      {/* Critical Intellectual Property / Independent Decanter Disclaimer */}
      <section className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8" aria-labelledby="ip-heading">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <ShieldAlert className="size-5" />
          </div>
          <div className="space-y-2">
            <h2 id="ip-heading" className="text-lg font-medium text-foreground">
              Independent Decanter Disclaimer & Intellectual Property
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong>{siteConfig.name}</strong> is an independent business decanting authentic luxury fragrances. We are <strong>not affiliated with, associated with, endorsed by, sponsored by, or connected in any manner</strong> with the fragrance manufacturers, designers, or trademark owners whose scents we decant.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All trademarks, product names, brand logos, and trade names mentioned on this site are the sole property of their respective trademark holders. Their mention is strictly for descriptive and nominative purposes to accurately identify the authentic fragrance contained inside our sterile 10ml vials.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground">
        {/* Nature of the Products */}
        <section aria-labelledby="products-nature-heading">
          <h2 id="products-nature-heading" className="text-xl font-medium tracking-tight text-foreground">
            1. Nature of Our Products
          </h2>
          <p className="mt-3">
            Unless explicitly designated otherwise, products sold on this platform are 10ml genuine decants transferred from authentic, original manufacturer bottles into sterile glass spray vials, or curated 3-piece discovery sets containing 10ml decants.
          </p>
          <p className="mt-2">
            Every decanting process is performed with high-grade laboratory pipettes under clean, controlled standards to guarantee that the fragrance you receive is 100% untampered and identical to the original perfume.
          </p>
        </section>

        {/* Pricing & Currency */}
        <section aria-labelledby="pricing-heading">
          <h2 id="pricing-heading" className="text-xl font-medium tracking-tight text-foreground">
            2. Pricing, Currency & Orders
          </h2>
          <p className="mt-3">
            All prices on this storefront are displayed in Kenya Shillings (KES) inclusive of applicable taxes. Delivery is charged at a flat rate of KES 300 nationwide across Kenya.
          </p>
          <p className="mt-2">
            We reserve the right to correct typographical errors in pricing or product descriptions. An order confirmation email represents an acknowledgment of your order request, not formal acceptance. We reserve the right to decline or cancel orders due to stock unavailability or fraud screening.
          </p>
        </section>

        {/* Payment Methods */}
        <section aria-labelledby="payments-heading">
          <h2 id="payments-heading" className="text-xl font-medium tracking-tight text-foreground">
            3. Payment Terms & M-Pesa
          </h2>
          <p className="mt-3">
            Payment must be completed in full before orders are prepared and dispatched. We accept M-Pesa (via STK push to Safaricom lines) and major debit/credit cards.
          </p>
          <p className="mt-2">
            In the event that an M-Pesa STK push request times out or is declined on your handset, no funds will be deducted. You may re-initiate payment or contact support if you experience persistent connectivity issues.
          </p>
        </section>

        {/* Shipping & Delivery */}
        <section aria-labelledby="shipping-terms-heading">
          <h2 id="shipping-terms-heading" className="text-xl font-medium tracking-tight text-foreground">
            4. Shipping, Risk of Loss & Inspection
          </h2>
          <p className="mt-3">
            Delivery timelines (next-day in Nairobi, 2–3 business days upcountry) are estimates provided in good faith. Risk of loss passes to you upon courier delivery confirmation to the specified delivery address.
          </p>
          <p className="mt-2">
            You are responsible for providing an accurate delivery address, active contact phone number (+254), and being available or designating a representative to receive the parcel.
          </p>
        </section>

        {/* Hygiene Returns & Transit Damage */}
        <section aria-labelledby="returns-terms-heading">
          <h2 id="returns-terms-heading" className="text-xl font-medium tracking-tight text-foreground">
            5. Hygiene & Returns Policy
          </h2>
          <p className="mt-3">
            In compliance with health and cosmetic safety standards, <strong>unsealed or opened decants cannot be returned or refunded</strong>. Olfactory preference is personal; purchasing a 10ml decant is specifically intended to mitigate the financial risk of blind-buying full bottles.
          </p>
          <p className="mt-2">
            In the event of bottles arriving damaged, broken, or leaking due to courier mishandling, we will provide an immediate free replacement upon notification within 48 hours of receipt accompanied by photographic evidence.
          </p>
        </section>

        {/* Governing Law & Dispute Resolution */}
        <section aria-labelledby="law-heading">
          <h2 id="law-heading" className="text-xl font-medium tracking-tight text-foreground">
            6. Governing Law & Jurisdiction
          </h2>
          <p className="mt-3">
            These Terms of Service and any contractual or non-contractual disputes arising out of or related to your transactions with us shall be governed exclusively by and construed in accordance with the <strong>Laws of Kenya</strong>.
          </p>
          <p className="mt-2">
            The courts located in Nairobi, Kenya shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these terms.
          </p>
        </section>
      </div>

      {/* Contact Section */}
      <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:p-8">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Questions Regarding Our Terms?
          </h2>
          <p className="text-sm text-muted-foreground">
            Reach out to our customer care team for clarifications.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
        >
          Contact legal & support
        </Link>
      </section>
    </main>
  );
}
