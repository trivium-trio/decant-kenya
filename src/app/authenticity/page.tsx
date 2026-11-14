import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Pipette, Camera, FileCheck, PackageCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Authenticity Guarantee",
  description:
    "Our 100% authenticity guarantee: verified batch codes, sterile decanting, unboxing proof photos, and a full replacement policy for any concerns.",
  alternates: {
    canonical: "/authenticity",
  },
};

export default function AuthenticityPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <section className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="size-3.5" />
          100% Authentic
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Authenticity Guarantee
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Every decant we sell is genuine, verifiable, and drawn from sealed manufacturer bottles. No exceptions.
        </p>
      </section>

      {/* Guarantee points */}
      <section className="mt-12 space-y-6" aria-labelledby="guarantee-heading">
        <h2 id="guarantee-heading" className="sr-only">
          What our guarantee covers
        </h2>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Verified batch codes
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every source bottle has a manufacturer batch code. We record and verify these codes so you can confirm the origin and production date of your decant. Request your batch code photo via WhatsApp or email at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Camera className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Unboxing proof
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Before every decanting session, we photograph the sealed source bottle with its cellophane wrapper, batch sticker, and brand packaging intact. These photos are available for any product on request.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Pipette className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Sterile decanting process
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We use sterile single-use laboratory pipettes in a clean, temperature-controlled environment. Each vial is individually filled, sealed, and labelled with the perfume name, house, and batch reference. We never dilute, alter, or blend with carrier oils.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Replacement guarantee
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                If you have any concern about the authenticity of a decant you received, contact us within 48 hours of delivery. We will send a free replacement or issue a full refund — no questions asked. See our{" "}
                <Link href="/shipping-returns" className="text-primary hover:underline">
                  returns policy
                </Link>{" "}
                for full details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:p-8">
        <div>
          <h2 className="text-lg font-medium text-foreground">
            Ready to explore with confidence?
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse our collection knowing every decant is 100% genuine.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          Browse perfumes
        </Link>
      </section>
    </main>
  );
}
