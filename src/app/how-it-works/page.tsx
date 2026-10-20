import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Heart, CheckCircle2, ShieldCheck, Droplets, Pipette } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Experience luxury fragrance through authentic 10ml decants. Try it first, love it, own it across Kenya.",
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

      {/* The 3-Step Journey */}
      <section className="mt-12" aria-labelledby="journey-heading">
        <h2 id="journey-heading" className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          The Three-Step Model
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Droplets className="size-5" />
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 01
            </span>
            <h3 className="mt-1 text-lg font-medium text-foreground">
              Try it first
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Select any 10ml decant or curate a 3-piece discovery set. A 10ml vial gives you 120–150 fine sprays—plenty for a full month of daily application.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Heart className="size-5" />
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 02
            </span>
            <h3 className="mt-1 text-lg font-medium text-foreground">
              Love it
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Paper test strips in stores lie. Wear the scent in real Kenya weather, during work meetings, and on evenings out to see how the dry-down performs on your unique skin chemistry.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col rounded-xl border border-border bg-card p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="size-5" />
            </div>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Step 03
            </span>
            <h3 className="mt-1 text-lg font-medium text-foreground">
              Own it
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Once you find a perfume that commands compliments and feels like your personal signature, invest in a full retail bottle with total peace of mind.
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
