import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, MessageSquare } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Find answers to questions about decant sizes, 100% authenticity, M-Pesa payments, and delivery across Kenya.",
  alternates: {
    canonical: "/faq",
  },
};

const faqItems = [
  {
    id: "size",
    question: "What is a perfume decant, and why do you only offer 10ml?",
    answer:
      "A perfume decant is 100% genuine fragrance transferred directly from an original manufacturer bottle into a smaller, portable glass atomizer. We specialize exclusively in 10ml decants because 10ml provides approximately 120–150 fine sprays—enough for 4 to 6 weeks of daily wear. It gives you the full experience of living with a luxury fragrance across different settings, temperatures, and moods before committing to a full KES 25,000+ bottle.",
  },
  {
    id: "authenticity",
    question: "Are your fragrances 100% genuine and authentic?",
    answer:
      "Yes, unconditionally. We source all full bottles directly from authorized brand distributors and verified luxury retailers. Every decant is hand-drawn using sterile laboratory pipettes into clean, sealed glass atomizers with verified batch codes. We never dilute, alter, adulterate, or blend our fragrances with carrier oils or alcohol.",
  },
  {
    id: "mpesa",
    question: "How do M-Pesa payments work on Decant Kenya?",
    answer:
      "We utilize official M-Pesa STK Push. During checkout, enter your Safaricom mobile phone number and click place order. A secure prompt immediately pops up on your phone asking for your M-Pesa PIN. Once entered, the payment is confirmed within seconds, and you receive an instant M-Pesa transaction SMS. We also accept Visa and Mastercard debit and credit cards.",
  },
  {
    id: "shipping",
    question: "How much is delivery and how long does it take?",
    answer:
      "We charge a flat delivery rate of KES 300 to any address across Kenya. For Nairobi and environs, orders placed before 12:00 PM are delivered next day (or same-day when feasible). Upcountry deliveries across all 47 counties take 2 to 3 business days via our trusted courier partners with tracking.",
  },
  {
    id: "damage",
    question: "What happens if my package arrives damaged or leaking?",
    answer:
      "Every decant is packed in custom shock-absorbing foam and leak-proof glass atomizers. However, in the rare event of transit damage or leakage, simply notify us via WhatsApp or email within 48 hours of delivery with your order number and a photo of the damaged parcel. We dispatch a prompt, free replacement immediately.",
  },
  {
    id: "returns",
    question: "Can I return a decant if I don't like the scent?",
    answer:
      "Because fragrance is an intimate cosmetic and personal hygiene product, opened or unsealed decants cannot be returned or exchanged. The primary purpose of our 10ml decants is to provide an accessible, low-risk way to test a fragrance thoroughly before investing in a full bottle.",
  },
  {
    id: "storage",
    question: "How should I store my 10ml decants to preserve freshness?",
    answer:
      "Store your decants upright in a cool, dark location away from direct sunlight, moisture, and extreme temperature changes (such as car glove compartments or steam-filled bathrooms). Proper storage ensures the top, heart, and base notes remain true and vibrant for up to 2 years.",
  },
  {
    id: "bottles",
    question: "Do you sell full bottles?",
    answer:
      "We currently focus solely on 10ml decants and 3-piece discovery sets under our 'Try it first, Love it, Own it' philosophy. Full bottle purchasing options will be made available in a future phase.",
  },
];

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
      <section className="text-center md:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-primary">
          <HelpCircle className="size-3.5" />
          Got Questions?
        </span>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Everything you need to know about our 10ml decants, authenticity guarantee, M-Pesa payments, and nationwide delivery.
        </p>
      </section>

      {/* Accordion list */}
      <section className="mt-10 rounded-xl border border-border bg-card p-6 md:p-8" aria-label="FAQ Accordion">
        <Accordion multiple defaultValue={["size"]}>
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-base font-medium text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Still need help CTA */}
      <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              Have another question?
            </h2>
            <p className="text-sm text-muted-foreground">
              Our Nairobi customer care team is here to assist you via WhatsApp or email.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
        >
          Contact support
        </Link>
      </section>
    </main>
  );
}
