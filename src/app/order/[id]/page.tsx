import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { getShopApi } from "@/lib/data/api";
import { Price } from "@/components/shared/price";
import { formatPhoneDisplay } from "@/lib/checkout/validation";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingOrderPoller } from "@/components/order/pending-order-poller";
import {
  CheckCircle2,
  PackageCheck,
  MapPin,
  CreditCard,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};

function OrderSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-64 rounded-md" />
        <Skeleton className="mx-auto h-4 w-96 rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-7 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="md:col-span-5 space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

async function OrderContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; payment?: string }>;
}) {
  await connection();
  const { id } = await params;
  const { token } = await searchParams;
  const order = await getShopApi().getOrder(id, token);

  if (!order) {
    notFound();
  }

  const hasValidToken = Boolean(
    token && order.accessToken && order.accessToken === token
  );

  const subtotalMoney = { amount: order.subtotal, currency: "KES" };
  const deliveryMoney = { amount: order.deliveryFee, currency: "KES" };
  const totalMoney = { amount: order.total, currency: "KES" };

  const isPaid = order.paymentStatus === "paid";
  const isPending = order.paymentStatus === "pending";
  const isFailed = order.paymentStatus === "failed";
  const isExpired = order.paymentStatus === "expired";

  const firstName = hasValidToken
    ? order.address.fullName.split(" ")[0]
    : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          {isPaid && (
            <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
          )}
          {isPending && (
            <Clock className="h-8 w-8 text-primary animate-pulse" aria-hidden="true" />
          )}
          {(isFailed || isExpired) && (
            <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          )}
        </div>

        <div className="space-y-1">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              isPaid
                ? "bg-primary/10 text-primary"
                : isPending
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {isPaid
              ? "Order Confirmed"
              : isPending
              ? "Payment Pending"
              : isExpired
              ? "Reservation Expired"
              : "Payment Unsuccessful"}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {firstName
              ? `Thank you, ${firstName}!`
              : `Order ${order.reference}`}
          </h1>

          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {isPaid
              ? "Your order has been received and is being prepared for dispatch."
              : isPending
              ? "Your order is created and awaiting confirmation of payment."
              : isExpired
              ? "The 10-minute stock reservation expired before payment completed."
              : order.paymentFailureReason ??
                "Your payment could not be processed. Please retry or choose an alternate payment method."}
          </p>
        </div>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
          <span className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-foreground font-medium">
            Order Reference: {order.reference}
          </span>
          <span className="rounded-md border border-border bg-background px-3 py-1.5 capitalize text-foreground">
            Status: {order.paymentStatus}
          </span>
          {isPaid && (
            <span className="rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 capitalize text-primary font-medium">
              Fulfillment: {order.fulfillmentStatus ?? "Processing"}
            </span>
          )}
        </div>
      </div>

      {/* Pending status poller if order is pending */}
      {isPending && (
        <PendingOrderPoller
          reference={order.reference}
          token={token}
          initialStatus={order.paymentStatus}
        />
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left Column: Order Items & Summary */}
        <div className="space-y-6 md:col-span-7">
          <section
            aria-labelledby="items-heading"
            className="rounded-xl border border-border bg-card p-6 space-y-4"
          >
            <h2
              id="items-heading"
              className="text-base font-medium text-foreground flex items-center gap-2"
            >
              <PackageCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Items in your order</span>
            </h2>

            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={`${item.kind}-${item.id}`}
                  className="py-3 flex justify-between items-start gap-4 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.brand && (
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.kind === "set"
                        ? "Discovery Set (3 × 10ml)"
                        : "10ml Decant"}{" "}
                      • Qty: {item.quantity} ×{" "}
                      <Price money={{ amount: item.unitPrice, currency: "KES" }} />
                    </p>
                  </div>
                  <Price
                    money={{ amount: item.totalPrice, currency: "KES" }}
                    className="font-medium text-foreground shrink-0"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <Price money={subtotalMoney} className="text-foreground" />
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery (Kenya)</span>
                <Price money={deliveryMoney} className="text-foreground" />
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                <span>{isPaid ? "Total Paid" : "Total"}</span>
                <Price
                  money={totalMoney}
                  className="text-lg font-bold text-foreground"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Delivery Details & Payment Info */}
        <div className="space-y-6 md:col-span-5">
          {/* Delivery Details */}
          <section
            aria-labelledby="shipping-heading"
            className="rounded-xl border border-border bg-card p-6 space-y-4"
          >
            <h2
              id="shipping-heading"
              className="text-base font-medium text-foreground flex items-center gap-2"
            >
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Delivery Details</span>
            </h2>

            {hasValidToken ? (
              <div className="text-sm space-y-1.5 text-muted-foreground">
                <p className="font-medium text-foreground">{order.address.fullName}</p>
                {order.email && <p>{order.email}</p>}
                <p>{formatPhoneDisplay(order.address.phone)}</p>
                <p>{order.address.buildingOrHouse}</p>
                <p>{order.address.estateOrLandmark}</p>
                <p>{order.address.county}, Kenya</p>
                {order.address.deliveryNotes && (
                  <div className="mt-2 rounded bg-background/60 p-2 text-xs border border-border">
                    <span className="font-semibold text-foreground">Note: </span>
                    {order.address.deliveryNotes}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg bg-background/50 border border-border p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Lock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>Protected Customer Details</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Customer name, phone number, and street address are hidden to protect privacy.
                    A confirmation was sent to the email you provided.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    County:{" "}
                    <span className="text-foreground font-medium">
                      {order.address.county}, Kenya
                    </span>
                  </p>
                  <p>
                    Recipient:{" "}
                    <span className="font-mono text-muted-foreground">
                      ••••••••
                    </span>
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Payment & Security */}
          <section
            aria-labelledby="payment-info-heading"
            className="rounded-xl border border-border bg-card p-6 space-y-3"
          >
            <h2
              id="payment-info-heading"
              className="text-base font-medium text-foreground flex items-center gap-2"
            >
              {order.paymentMethod === "mpesa" ? (
                <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
              ) : (
                <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
              )}
              <span>Payment Method</span>
            </h2>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="text-foreground font-medium">
                {order.paymentMethod === "mpesa"
                  ? "M-Pesa STK Push"
                  : "Credit / Debit Card"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPaid
                  ? "Payment settled & verified"
                  : isPending
                  ? "Awaiting gateway settlement"
                  : "Unconfirmed"}
              </p>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>Email updates will be sent upon courier dispatch.</span>
            </div>
          </section>

          {/* CTA */}
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; payment?: string }>;
}) {
  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
