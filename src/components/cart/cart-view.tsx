"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_LINE_QUANTITY, useCart } from "@/lib/cart/store";
import { validateCartAction } from "@/app/cart/actions";
import type { PricedCartLine, ValidatedCart } from "@/lib/data/types";

export function CartView() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  const [validationResult, setValidationResult] = useState<ValidatedCart | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const runValidation = useCallback((currentLines: typeof lines) => {
    if (currentLines.length === 0) return;
    setIsValidating(true);
    setError(null);

    startTransition(async () => {
      try {
        const result = await validateCartAction(currentLines);
        setValidationResult(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to validate cart. Please try again.");
      } finally {
        setIsValidating(false);
      }
    });
  }, []);

  useEffect(() => {
    if (lines.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      runValidation(lines);
    }, 300);

    return () => clearTimeout(timer);
  }, [lines, runValidation]);

  const isEmpty = lines.length === 0;

  // Merging validation lines with cart lines for optimistic display
  const displayLines: (PricedCartLine & { issueMessage?: string })[] = lines.map((l) => {
    const val = validationResult?.lines.find((vl) => vl.kind === l.kind && vl.itemId === l.itemId);
    const isAvailable = val ? val.available : true;
    let issueMessage: string | undefined;

    if (val && !val.available) {
      if (l.kind === "product") {
        issueMessage = `${val.name} is sold out.`;
      } else {
        issueMessage = `${val.name} includes a sold-out item.`;
      }
    }

    return {
      kind: l.kind,
      itemId: l.itemId,
      quantity: l.quantity,
      name:
        val?.name ??
        (l.kind === "product"
          ? `[Perfume ${l.itemId.replace(/\D/g, "") || ""}]`
          : `[Discovery Set ${l.itemId.replace(/\D/g, "") || ""}]`),
      unitPrice: val?.unitPrice ?? { amount: l.kind === "product" ? 150000 : 400000, currency: "KES" },
      available: isAvailable,
      issueMessage,
    };
  });

  const hasUnavailableItems = displayLines.some((l) => !l.available);
  const subtotal = validationResult?.subtotal ?? {
    amount: displayLines.filter((l) => l.available).reduce((sum, l) => sum + l.unitPrice.amount * l.quantity, 0),
    currency: "KES",
  };

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 text-center md:px-8">
        <h1 className="text-2xl font-medium tracking-tight">Shopping cart</h1>
        <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-foreground">
          <p className="font-medium text-destructive">{error}</p>
          <Button
            type="button"
            onClick={() => runValidation(lines)}
            className="mt-4 min-h-11 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </Button>
        </div>
      </main>
    );
  }

  if (isEmpty) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16 text-center md:px-8">
        <h1 className="text-3xl font-medium tracking-tight">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Looks like you haven&apos;t added any fragrances yet.</p>
        <div className="mt-8">
          <Link
            href="/sets"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse discovery sets
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 pb-48 md:px-8 md:py-12 md:pb-16">
      <h1 className="text-3xl font-medium tracking-tight">Shopping cart</h1>

      <div className="mt-8 md:grid md:grid-cols-[1.5fr_1fr] md:items-start md:gap-8">
        {/* Line Items List */}
        <section aria-label="Cart items" className="flex flex-col divide-y divide-border rounded-lg bg-card p-4 md:p-6">
          {isValidating && !validationResult ? (
            <div className="space-y-4 py-2">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          ) : (
            displayLines.map((line) => {
              const lineTotal = line.unitPrice.amount * line.quantity;
              return (
                <div key={`${line.kind}-${line.itemId}`} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-base font-medium">{line.name}</h2>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        {line.kind === "product" ? "10ml decant" : "Discovery set"}
                      </p>
                      <Price money={line.unitPrice} className="mt-1 block text-sm text-muted-foreground" />
                    </div>

                    <div className="text-right">
                      {line.available ? (
                        <Price
                          money={{ amount: lineTotal, currency: line.unitPrice.currency }}
                          className="text-base font-medium"
                        />
                      ) : (
                        <span className="rounded-md bg-destructive/15 px-2 py-1 text-xs font-semibold uppercase text-destructive">
                          Sold out
                        </span>
                      )}
                    </div>
                  </div>

                  {!line.available && line.issueMessage && (
                    <p className="text-xs font-medium text-destructive">{line.issueMessage}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* Quantity Stepper */}
                    <div className="inline-flex items-center rounded-md border border-border bg-background">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.kind, line.itemId, line.quantity - 1)}
                        disabled={line.quantity <= 1}
                        aria-label={`Decrease quantity of ${line.name}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center text-lg font-medium hover:bg-accent disabled:opacity-40"
                      >
                        –
                      </button>
                      <span className="px-3 text-sm font-medium" aria-label={`Quantity: ${line.quantity}`}>
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.kind, line.itemId, line.quantity + 1)}
                        disabled={line.quantity >= MAX_LINE_QUANTITY || !line.available}
                        aria-label={`Increase quantity of ${line.name}`}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center text-lg font-medium hover:bg-accent disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => remove(line.kind, line.itemId)}
                      aria-label={`Remove ${line.name} from cart`}
                      className="inline-flex min-h-11 items-center px-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Order Summary */}
        <section
          aria-label="Order summary"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur md:static md:rounded-lg md:border md:bg-card md:p-6 md:shadow-none"
        >
          <h2 className="hidden text-lg font-medium md:block">Order summary</h2>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
            <div aria-live="polite">
              <Price money={subtotal} className="text-xl font-medium tracking-tight" />
            </div>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">[Delivery is calculated at checkout]</p>

          {hasUnavailableItems && (
            <p className="mt-2 text-xs font-medium text-destructive">
              Please remove unavailable items before proceeding to checkout.
            </p>
          )}

          <div className="mt-4">
            {hasUnavailableItems || subtotal.amount === 0 ? (
              <Button
                type="button"
                disabled
                className="min-h-11 w-full bg-primary font-medium text-primary-foreground opacity-50 cursor-not-allowed"
              >
                Checkout
              </Button>
            ) : (
              <Link
                href="/checkout"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
              >
                Checkout
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
