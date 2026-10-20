import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fast, secure checkout with instant M-Pesa or card payment.
        </p>
      </div>
      <CheckoutForm />
    </main>
  );
}

