"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Price } from "@/components/shared/price";
import { useCart } from "@/lib/cart/store";
import { validateCartAction } from "@/app/cart/actions";
import { createOrderAction } from "@/app/checkout/actions";
import {
  KENYA_COUNTIES,
  formatPhoneDisplay,
  validateKenyanPhone,
} from "@/lib/checkout/validation";
import type { PaymentMethod, PricedCartLine, ValidatedCart } from "@/lib/data/types";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
} from "lucide-react";

export function CheckoutForm() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);

  const [validationResult, setValidationResult] = useState<ValidatedCart | null>(null);
  const [, startValidateTransition] = useTransition();

  // Form fields state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [estateOrLandmark, setEstateOrLandmark] = useState("");
  const [buildingOrHouse, setBuildingOrHouse] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [useDeliveryPhoneForMpesa, setUseDeliveryPhoneForMpesa] = useState(true);
  const [mpesaPhone, setMpesaPhone] = useState("");

  // Submission state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // STK Push simulation modal state
  const [stkModalOpen, setStkModalOpen] = useState(false);
  const [stkTargetPhone, setStkTargetPhone] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (lines.length === 0) return;

    startValidateTransition(async () => {
      try {
        const result = await validateCartAction(lines);
        setValidationResult(result);
      } catch {
        // Fallback silently if offline/temporarily unavailable
      }
    });
  }, [lines]);

  // Build display lines
  const displayLines: PricedCartLine[] = lines.map((l) => {
    const val = validationResult?.lines.find((vl) => vl.kind === l.kind && vl.itemId === l.itemId);
    return {
      kind: l.kind,
      itemId: l.itemId,
      quantity: l.quantity,
      name: val?.name ?? (l.kind === "set" ? "[Discovery Set]" : "[Fragrance]"),
      unitPrice: val?.unitPrice ?? { amount: l.kind === "set" ? 400000 : 150000, currency: "KES" },
      available: val?.available ?? true,
    };
  });

  const subtotalAmount = displayLines
    .filter((l) => l.available)
    .reduce((sum, l) => sum + l.unitPrice.amount * l.quantity, 0);

  const deliveryFeeAmount = 30000; // Fixed KES 300 in minor units
  const totalAmount = subtotalAmount + deliveryFeeAmount;

  const subtotalMoney = { amount: subtotalAmount, currency: "KES" };
  const deliveryMoney = { amount: deliveryFeeAmount, currency: "KES" };
  const totalMoney = { amount: totalAmount, currency: "KES" };

  // Auto-advance STK push after 3 seconds
  useEffect(() => {
    if (!stkModalOpen || !createdOrderId) return;

    const timer = setTimeout(() => {
      clearCart();
      router.push(`/order/${createdOrderId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [stkModalOpen, createdOrderId, clearCart, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters.";
    }

    const phoneVal = validateKenyanPhone(phone);
    if (!phoneVal.isValid) {
      newErrors.phone = phoneVal.error ?? "Please enter a valid Kenyan phone number.";
    }

    if (!county.trim()) {
      newErrors.county = "Please select a county.";
    }

    if (!estateOrLandmark.trim()) {
      newErrors.estateOrLandmark = "Estate or landmark is required.";
    }

    if (!buildingOrHouse.trim()) {
      newErrors.buildingOrHouse = "Building, house number or door is required.";
    }

    if (deliveryNotes.length > 200) {
      newErrors.deliveryNotes = "Delivery notes cannot exceed 200 characters.";
    }

    if (paymentMethod === "mpesa" && !useDeliveryPhoneForMpesa) {
      const mpesaVal = validateKenyanPhone(mpesaPhone);
      if (!mpesaVal.isValid) {
        newErrors.mpesaPhone = mpesaVal.error ?? "Enter a valid M-Pesa phone number.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (isSubmitting) return;

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveMpesaPhone =
        paymentMethod === "mpesa"
          ? useDeliveryPhoneForMpesa
            ? phone
            : mpesaPhone
          : undefined;

      const order = await createOrderAction({
        items: lines.map((l) => ({ id: l.itemId, kind: l.kind, quantity: l.quantity })),
        address: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          county,
          estateOrLandmark: estateOrLandmark.trim(),
          buildingOrHouse: buildingOrHouse.trim(),
          deliveryNotes: deliveryNotes.trim() || undefined,
        },
        paymentMethod,
        mpesaPhone: effectiveMpesaPhone?.trim(),
      });

      setCreatedOrderId(order.id);

      if (paymentMethod === "mpesa") {
        setStkTargetPhone(effectiveMpesaPhone ?? phone);
        setStkModalOpen(true);
      } else {
        // Direct advance for simulated card payment
        clearCart();
        router.push(`/order/${order.id}`);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (lines.length === 0 && !stkModalOpen) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card border border-border">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          You have no items in your cart to checkout. Browse our collection to pick your 10ml decants.
        </p>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse perfumes
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Delivery & Payment Details */}
          <div className="space-y-8 lg:col-span-7">
            {serverError && (
              <div
                role="alert"
                className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
              >
                <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{serverError}</p>
              </div>
            )}

            {/* Section 1: Delivery Address */}
            <section aria-labelledby="delivery-heading" className="rounded-xl border border-border bg-card/60 p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 id="delivery-heading" className="text-lg font-medium text-foreground">
                  Delivery Details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Where should we dispatch your decants in Kenya?
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                    }}
                    placeholder="e.g., Amani Kamau"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    className="flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                  {errors.fullName && (
                    <p id="fullName-error" role="alert" className="mt-1 text-xs text-destructive">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="e.g., 0712 345 678 or +254712345678"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className="flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                    />
                  </div>
                  {errors.phone ? (
                    <p id="phone-error" role="alert" className="mt-1 text-xs text-destructive">
                      {errors.phone}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      We will SMS dispatch updates to this number.
                    </p>
                  )}
                </div>

                {/* County */}
                <div>
                  <label htmlFor="county" className="block text-sm font-medium text-foreground mb-1.5">
                    County / Town <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="county"
                    name="county"
                    required
                    value={county}
                    onChange={(e) => {
                      setCounty(e.target.value);
                      if (errors.county) setErrors((prev) => ({ ...prev, county: "" }));
                    }}
                    className="flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
                  >
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estate / Landmark */}
                <div>
                  <label htmlFor="estateOrLandmark" className="block text-sm font-medium text-foreground mb-1.5">
                    Estate / Area / Landmark <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="estateOrLandmark"
                    name="estateOrLandmark"
                    type="text"
                    required
                    value={estateOrLandmark}
                    onChange={(e) => {
                      setEstateOrLandmark(e.target.value);
                      if (errors.estateOrLandmark) setErrors((prev) => ({ ...prev, estateOrLandmark: "" }));
                    }}
                    placeholder="e.g., Kilimani, near Yaya Centre"
                    aria-invalid={Boolean(errors.estateOrLandmark)}
                    aria-describedby={errors.estateOrLandmark ? "estate-error" : undefined}
                    className="flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                  {errors.estateOrLandmark && (
                    <p id="estate-error" role="alert" className="mt-1 text-xs text-destructive">
                      {errors.estateOrLandmark}
                    </p>
                  )}
                </div>

                {/* Building / House */}
                <div>
                  <label htmlFor="buildingOrHouse" className="block text-sm font-medium text-foreground mb-1.5">
                    Building / House number / Door <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="buildingOrHouse"
                    name="buildingOrHouse"
                    type="text"
                    required
                    value={buildingOrHouse}
                    onChange={(e) => {
                      setBuildingOrHouse(e.target.value);
                      if (errors.buildingOrHouse) setErrors((prev) => ({ ...prev, buildingOrHouse: "" }));
                    }}
                    placeholder="e.g., Apex Apartments, Flat 3B"
                    aria-invalid={Boolean(errors.buildingOrHouse)}
                    aria-describedby={errors.buildingOrHouse ? "building-error" : undefined}
                    className="flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                  {errors.buildingOrHouse && (
                    <p id="building-error" role="alert" className="mt-1 text-xs text-destructive">
                      {errors.buildingOrHouse}
                    </p>
                  )}
                </div>

                {/* Delivery Notes */}
                <div>
                  <label htmlFor="deliveryNotes" className="block text-sm font-medium text-foreground mb-1.5">
                    Delivery Notes <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="deliveryNotes"
                    name="deliveryNotes"
                    rows={2}
                    maxLength={200}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g., Call upon arrival, leave with security guard..."
                    className="flex w-full rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Payment Method */}
            <section aria-labelledby="payment-heading" className="rounded-xl border border-border bg-card/60 p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 id="payment-heading" className="text-lg font-medium text-foreground">
                  Payment Method
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fast, secure payments verified instantly.
                </p>
              </div>

              {/* Payment selection radio options */}
              <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                {/* M-Pesa Option */}
                <label
                  htmlFor="payment-mpesa"
                  className={`flex min-h-11 cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                    paymentMethod === "mpesa"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="payment-mpesa"
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={paymentMethod === "mpesa"}
                      onChange={() => setPaymentMethod("mpesa")}
                      className="h-4 w-4 accent-primary"
                    />
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" aria-hidden="true" />
                      <span className="font-medium text-foreground text-sm">M-Pesa (STK Push)</span>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-medium">Recommended</span>
                </label>

                {/* Card Option */}
                <label
                  htmlFor="payment-card"
                  className={`flex min-h-11 cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                    paymentMethod === "card"
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-background/50 text-muted-foreground hover:bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="payment-card"
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="h-4 w-4 accent-primary"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      <span className="font-medium text-foreground text-sm">Credit / Debit Card</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* M-Pesa Details */}
              {paymentMethod === "mpesa" && (
                <div className="rounded-lg border border-border bg-background/40 p-4 space-y-4">
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
                    <input
                      id="useDeliveryPhoneForMpesa"
                      type="checkbox"
                      checked={useDeliveryPhoneForMpesa}
                      onChange={(e) => setUseDeliveryPhoneForMpesa(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span>Use delivery phone number for M-Pesa</span>
                  </label>

                  {!useDeliveryPhoneForMpesa && (
                    <div className="pt-2">
                      <label htmlFor="mpesaPhone" className="block text-sm font-medium text-foreground mb-1.5">
                        M-Pesa Phone Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="mpesaPhone"
                        name="mpesaPhone"
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => {
                          setMpesaPhone(e.target.value);
                          if (errors.mpesaPhone) setErrors((prev) => ({ ...prev, mpesaPhone: "" }));
                        }}
                        placeholder="e.g., 0712 345 678"
                        aria-invalid={Boolean(errors.mpesaPhone)}
                        aria-describedby={errors.mpesaPhone ? "mpesaPhone-error" : undefined}
                        className="flex min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                      />
                      {errors.mpesaPhone && (
                        <p id="mpesaPhone-error" role="alert" className="mt-1 text-xs text-destructive">
                          {errors.mpesaPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Card Notice (FR-28, NFR-24) */}
              {paymentMethod === "card" && (
                <div className="flex items-start gap-3 rounded-lg border border-border bg-background/80 p-4 text-xs text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">Secure Payment Guarantee</p>
                    <p className="mt-1">
                      Card payments powered by secure hosted provider. Raw card details are never handled by our store.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-xl border border-border bg-card/60 p-6 space-y-6">
              <h2 className="text-lg font-medium text-foreground border-b border-border pb-4">
                Order Summary
              </h2>

              {/* Itemized list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {displayLines.map((line) => {
                  const lineTotal = {
                    amount: line.unitPrice.amount * line.quantity,
                    currency: line.unitPrice.currency,
                  };
                  return (
                    <div key={`${line.kind}-${line.itemId}`} className="flex justify-between items-center text-sm">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="line-clamp-1 font-medium text-foreground">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {line.quantity} × <Price money={line.unitPrice} />
                        </p>
                      </div>
                      <Price money={lineTotal} className="font-medium text-foreground shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <Price money={subtotalMoney} className="text-foreground" />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Standard Delivery (Kenya)</span>
                  <Price money={deliveryMoney} className="text-foreground" />
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                  <span>Total Amount</span>
                  <Price money={totalMoney} className="text-xl font-bold text-foreground" />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Sending STK push...</span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === "mpesa" ? "Pay with M-Pesa" : "Complete Order"} (
                    <Price money={totalMoney} />)
                  </span>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                <span>100% Authentic decants guaranteed</span>
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Simulated M-Pesa STK Push Waiting Modal */}
      {stkModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stk-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h3 id="stk-modal-title" className="text-xl font-semibold text-foreground">
                STK Push Sent
              </h3>
              <p className="text-sm text-muted-foreground">
                STK push sent to <strong className="text-foreground">{formatPhoneDisplay(stkTargetPhone)}</strong>.
                Please enter your M-Pesa PIN on your phone to complete payment.
              </p>
            </div>

            <div className="rounded-lg bg-background/50 border border-border p-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              <span>Awaiting instant payment confirmation...</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (createdOrderId) {
                    clearCart();
                    router.push(`/order/${createdOrderId}`);
                  }
                }}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                I have completed payment
              </button>

              <button
                type="button"
                onClick={() => {
                  setStkModalOpen(false);
                  setIsSubmitting(false);
                }}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card"
              >
                Retry / Change number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
