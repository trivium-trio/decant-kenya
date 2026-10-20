import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy complying with Kenya's Data Protection Act, 2019, including our explicit Data-Collection Inventory.",
  alternates: {
    canonical: "/privacy",
  },
};

const inventory = [
  {
    feature: "Checkout & Order Delivery",
    fields: "Full name, phone number (+254 format), county, estate or landmark, building or house number, delivery notes",
    endpoint: "Server Action /api/checkout (submitCheckoutAction)",
    purpose: "Order fulfillment, courier dispatch, customer communication, and statutory financial accounting. (Contractual necessity, Sec 30(b))",
    retention: "7 years (Statutory Kenyan tax and financial record requirements)",
  },
  {
    feature: "M-Pesa Payment (STK Push)",
    fields: "Safaricom phone number (+254)",
    endpoint: "Payment gateway STK Push initiation",
    purpose: "Triggering phone authorization prompt and validating transaction receipt. (Contractual necessity, Sec 30(b))",
    retention: "7 years (Financial transaction records)",
  },
  {
    feature: "Customer Support Contact",
    fields: "Full name, email address, phone number (optional), subject, message content",
    endpoint: "Server Action /api/contact (submitContactAction)",
    purpose: "Responding to customer queries, addressing order issues, and providing post-purchase support. (Legitimate interest / Consent)",
    retention: "1 year following resolution of inquiry",
  },
  {
    feature: "Footer Newsletter Signup",
    fields: "Email address",
    endpoint: "Server Action /api/newsletter (subscribeNewsletterAction)",
    purpose: "Sending new arrival notifications, decant restock alerts, and fragrance guides. (Consent, Sec 32)",
    retention: "Until customer unsubscribes or 2 years of inactivity",
  },
  {
    feature: "Privacy & Consent Preferences",
    fields: "Consent choices (analytics/marketing preferences), timestamp",
    endpoint: "Client-side localStorage ('decant-consent')",
    purpose: "Respecting and remembering customer data collection preferences. (Compliance with DPA 2019)",
    retention: "1 year from date of preference selection",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <section>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-primary">
          <Shield className="size-3.5" />
          Kenya DPA 2019 Compliance
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          We are committed to protecting your personal data in full compliance with Kenya&apos;s Data Protection Act, 2019 and guidelines from the Office of the Data Protection Commissioner (ODPC).
        </p>
      </section>

      {/* Principles & Scope */}
      <section className="mt-10 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          This Privacy Policy explains how our shop collects, processes, stores, and protects your personal data when you browse our catalogue, purchase 10ml decants or discovery sets, contact our customer support team, or subscribe to our newsletter.
        </p>
        <p>
          We operate under the key principles established by the Kenya Data Protection Act, 2019: lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, and confidentiality.
        </p>
      </section>

      {/* Data Subject Rights (Section 26 Kenya DPA) */}
      <section className="mt-12 rounded-xl border border-border bg-card p-6 md:p-8" aria-labelledby="rights-heading">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <div>
            <h2 id="rights-heading" className="text-xl font-medium tracking-tight text-foreground">
              Your Rights Under Kenya&apos;s DPA (Section 26)
            </h2>
            <p className="text-sm text-muted-foreground">
              As a data subject in Kenya, you have clear statutory rights regarding your personal information:
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <div>
              <strong className="text-sm font-medium text-foreground">Right to be Informed:</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                To know how and why your personal data is collected and used.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <div>
              <strong className="text-sm font-medium text-foreground">Right of Access:</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                To request a copy of the personal data we hold about you.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <div>
              <strong className="text-sm font-medium text-foreground">Right to Rectification:</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                To have false, misleading, or outdated personal data corrected.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <div>
              <strong className="text-sm font-medium text-foreground">Right to Erasure:</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                To request deletion of data that is no longer required for legitimate legal purposes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <div>
              <strong className="text-sm font-medium text-foreground">Right to Object:</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                To object to the processing of your data for direct marketing purposes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <div>
              <strong className="text-sm font-medium text-foreground">Right to Data Portability:</strong>
              <p className="mt-0.5 text-xs text-muted-foreground">
                To receive your personal data in a structured, commonly used electronic format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explicit Data-Collection Inventory (FR-36) */}
      <section className="mt-12" aria-labelledby="inventory-heading">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
          <div>
            <h2 id="inventory-heading" className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              Data-Collection Inventory (FR-36)
            </h2>
            <p className="text-sm text-muted-foreground">
              A comprehensive record of every data collection touchpoint, endpoint, purpose, and retention window.
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto" tabIndex={0} aria-label="Data collection inventory table">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Touchpoint / Form</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Personal Fields Collected</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Processing Endpoint</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Purpose & Lawful Basis</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground align-top whitespace-nowrap sm:whitespace-normal">
                      {item.feature}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground align-top min-w-[200px]">
                      {item.fields}
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-muted-foreground align-top min-w-[180px]">
                      {item.endpoint}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground align-top min-w-[220px]">
                      {item.purpose}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground align-top min-w-[140px]">
                      {item.retention}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Security & Third-Party Disclosure */}
      <section className="mt-12 space-y-4 rounded-xl border border-border bg-card p-6 md:p-8" aria-labelledby="security-heading">
        <h2 id="security-heading" className="text-xl font-medium tracking-tight text-foreground">
          Data Security & Third Parties
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">Payment Security:</strong> We never capture or store raw debit or credit card details on our servers. All card processing is handled by PCI-DSS compliant providers. M-Pesa transactions are authenticated directly by Safaricom on your phone handset via encrypted STK Push.
          </p>
          <p>
            <strong className="text-foreground">Courier Partners:</strong> When your order is dispatched, we share only necessary delivery information (full name, delivery address, and phone number) with trusted Kenyan courier services strictly to complete your delivery.
          </p>
          <p>
            <strong className="text-foreground">No Sale of Personal Data:</strong> We never sell, rent, trade, or monetize your personal data to any third party for marketing or advertising.
          </p>
        </div>
      </section>

      {/* Contact DPO */}
      <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:p-8">
        <div>
          <h2 className="text-base font-medium text-foreground">
            Questions About Your Personal Data?
          </h2>
          <p className="text-sm text-muted-foreground">
            Contact our Data Protection Office or exercise your rights under Kenya&apos;s DPA.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
        >
          Contact privacy officer
        </Link>
      </section>
    </main>
  );
}
