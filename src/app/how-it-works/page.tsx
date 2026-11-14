import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ShieldCheck, Droplets, Pipette, ShoppingBag, Package, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How to buy authentic 10ml fragrance decants: browse, order, and get them delivered across Kenya.",
  alternates: {
    canonical: "/how-it-works",
  },
};

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      {/* Header section */}
      <section className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-primary">
          <Sparkles className="size-3.5" />
          The Decant Journey
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          How It Works
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Fragrance should never be a blind purchase. We provide authentic 10ml decants so you can wear, experience, and fall in love with luxury scents on your own terms.
        </p>
      </section>

      {/* The Decant Buying Journey */}
      <section className="mt-12" aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          Your Decant Journey
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingBag className="size-5" />
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 01
            </span>
            <h3 className="mt-1 text-lg font-medium text-foreground">
              Browse & pick
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Explore our curated collection of 10ml decants or choose a 3-piece discovery set. Watch our scent review videos to find your match.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 02
            </span>
            <h3 className="mt-1 text-lg font-medium text-foreground">
              Order & pay
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Check out with M-Pesa STK Push or card. Your order is confirmed in seconds and your decants are packed immediately.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 03
            </span>
            <h3 className="mt-1 text-lg font-medium text-foreground">
              Receive & wear
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your decants arrive in leak-proof packaging within 48 hours. Each 10ml vial gives you 120–150 fine sprays — enough for a full month of daily wear.
            </p>
          </div>
        </div>
      </section>

      {/* Decanting Quality Standards */}
      <section className="mt-14 rounded-xl border border-border bg-card p-6 md:p-8" aria-labelledby="quality-heading">
        <h2 id="quality-heading" className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          Our Decanting Standards
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                100% Guaranteed Authentic
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Every decant is drawn straight from brand-new, authenticated manufacturer bottles with verified batch codes. We never dilute, alter, or blend with oils.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <Pipette className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Sterile Laboratory Transfer
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                We use sterile single-use laboratory pipettes inside a clean, temperature-controlled environment to prevent cross-contamination and preserve original note integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hygiene Note */}
      <section className="mt-8 rounded-xl border border-border bg-card/60 p-6 md:p-8" aria-labelledby="hygiene-heading">
        <div className="flex gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Droplets className="size-5" />
          </div>
          <div>
            <h3 id="hygiene-heading" className="text-base font-medium text-foreground">
              Hygiene & Storage
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Because decants are cosmetic personal-care products, opened or unsealed vials cannot be returned or exchanged. Store your decants upright in a cool, dark place away from direct sunlight. Proper storage keeps the notes true for up to 2 years.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:p-8">
        <div>
          <h2 className="text-lg font-medium text-foreground">
            Ready to explore?
          </h2>
          <p className="text-sm text-muted-foreground">
            Find your next signature scent from our curated collection.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/shop"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse perfumes
          </Link>
          <Link
            href="/sets"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Discovery sets
          </Link>
        </div>
      </section>
    </main>
  );
}
