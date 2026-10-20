import type { Metadata } from "next";
import Link from "next/link";
import { Truck, ShieldCheck, RefreshCw, AlertCircle, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Kenya delivery timeframes, standard KES 300 flat rate shipping, packaging safety, and decant hygiene returns policy.",
  alternates: {
    canonical: "/shipping-returns",
  },
};

export default function ShippingReturnsPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <section>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-primary">
          <Truck className="size-3.5" />
          Kenya Nationwide Delivery
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Shipping & Returns
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Reliable dispatch across Nairobi and all 47 counties in Kenya, with leak-proof protective packaging and transparent customer care.
        </p>
      </section>

      {/* Shipping Rates & Timelines */}
      <section className="mt-12" aria-labelledby="delivery-heading">
        <h2 id="delivery-heading" className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          Delivery Options & Timeframes
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Nairobi */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Nairobi & Environs
              </span>
              <span className="rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
                Next-Day Delivery
              </span>
            </div>
            <h3 className="mt-3 text-lg font-medium text-foreground">
              Doorstep Delivery in Nairobi
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Orders placed before 12:00 PM are dispatched for same-day or next-business-day delivery directly to your home or office. Standard flat delivery rate of KES 300.
            </p>
          </div>

          {/* Upcountry */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Upcountry Kenya
              </span>
              <span className="rounded-md border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
                2–3 Business Days
              </span>
            </div>
            <h3 className="mt-3 text-lg font-medium text-foreground">
              Countrywide Courier Dispatch
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We deliver to Mombasa, Kisumu, Nakuru, Eldoret, Nyeri, and all regional hubs across Kenya via trusted courier services with SMS tracking. Flat rate of KES 300 nationwide.
            </p>
          </div>
        </div>
      </section>

      {/* Packaging Safety */}
      <section className="mt-12 rounded-xl border border-border bg-card p-6 md:p-8" aria-labelledby="packaging-heading">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PackageCheck className="size-5" />
          </div>
          <div>
            <h2 id="packaging-heading" className="text-xl font-medium tracking-tight text-foreground">
              Packaging & Transit Safety
            </h2>
            <p className="text-sm text-muted-foreground">
              Engineered to arrive in pristine, leak-free condition.
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <span>
              <strong className="text-foreground">Leak-proof glass atomizers:</strong> Each 10ml decant is bottled in heavy-base glass vials with precision threading and fine-mist spray nozzles.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <span>
              <strong className="text-foreground">Shock-absorbent protection:</strong> Every bottle is wrapped in protective cushioning and encased in discreet, tamper-evident shipping boxes.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <ShieldCheck className="size-5 shrink-0 text-primary" />
            <span>
              <strong className="text-foreground">Clear labeling:</strong> Each vial is clearly marked with the perfume name, house, and batch reference for easy identification.
            </span>
          </li>
        </ul>
      </section>

      {/* Returns & Replacement Policy */}
      <section className="mt-12" aria-labelledby="returns-heading">
        <h2 id="returns-heading" className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
          Returns & Replacements Policy
        </h2>

        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">
                  Hygiene Policy: No Returns Once Unsealed
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Because decants are cosmetic personal care products, we cannot accept returns or exchanges for opened, unsealed, or tested bottles due to hygiene and health regulations. The purpose of a 10ml decant is to allow you to experience a scent affordably before committing to a costly full bottle.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <RefreshCw className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">
                  Transit Damage & Leakage Guarantee
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  If your package arrives damaged, broken, or leaking, we will send an immediate free replacement. Please inspect your parcel upon arrival and contact us via WhatsApp or email within <strong>48 hours</strong> of delivery with your order number and a clear photograph of the damaged item.
                </p>
                <div className="mt-4">
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Contact customer support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
