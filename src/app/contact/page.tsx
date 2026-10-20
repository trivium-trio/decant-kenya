import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { Mail, Phone, Clock, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Customer Support",
  description: "Get in touch with our Nairobi customer support team for perfume consultations, decant inquiries, or order assistance.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
      <section className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-primary">
          <MessageCircle className="size-3.5" />
          Customer Care
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Have a question about a perfume note, need help choosing a discovery set, or want an update on your order? We are here to help.
        </p>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
        {/* Support Details Column */}
        <section className="space-y-6 md:col-span-5" aria-label="Support Information">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-medium text-foreground">
              Contact Channels
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Direct assistance from our Nairobi fragrance specialists.
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="size-4" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">WhatsApp & Phone</span>
                  <a
                    href="tel:+254700000000"
                    className="mt-0.5 inline-flex min-h-11 items-center font-medium text-foreground hover:text-primary transition-colors"
                  >
                    +254 700 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Email Support</span>
                  <a
                    href="mailto:support@decantkenya.co.ke"
                    className="mt-0.5 inline-flex min-h-11 items-center font-medium text-foreground hover:text-primary transition-colors"
                  >
                    [support@example.com]
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="size-4" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Operating Hours</span>
                  <p className="mt-0.5 font-medium text-foreground">
                    Mon – Sat: 9:00 AM – 6:00 PM EAT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sundays & Public Holidays: Closed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground">Dispatch Center</span>
                  <p className="mt-0.5 font-medium text-foreground">
                    Nairobi, Kenya
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Online shop with nationwide courier fulfillment
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-foreground">
              Frequently Asked First?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Looking for quick answers regarding our 10ml vials or delivery times?
            </p>
            <div className="mt-4">
              <Link
                href="/faq"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
              >
                Read our FAQ guide &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Form Column */}
        <section className="rounded-xl border border-border bg-card p-6 md:col-span-7 md:p-8" aria-label="Send us a message">
          <h2 className="text-xl font-medium tracking-tight text-foreground">
            Send Us a Message
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill out the form below and we will get back to you within 24 hours.
          </p>

          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </main>
  );
}
