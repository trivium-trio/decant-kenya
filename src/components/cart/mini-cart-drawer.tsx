"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Price } from "@/components/shared/price";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MAX_LINE_QUANTITY, useCart } from "@/lib/cart/store";
import { validateCartAction } from "@/app/cart/actions";
import type { PricedCartLine, ValidatedCart } from "@/lib/data/types";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export function MiniCartDrawer() {
  const isOpen = useCart((s) => s.isDrawerOpen);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  const [validationResult, setValidationResult] = useState<ValidatedCart | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (lines.length === 0) return;

    startTransition(async () => {
      try {
        const result = await validateCartAction(lines);
        setValidationResult(result);
      } catch {
        // Fallback silently if validation fails temporarily
      }
    });
  }, [lines]);

  const isEmpty = lines.length === 0;

  // Build priced display lines
  const displayLines: (PricedCartLine & { issueMessage?: string })[] = lines.map((l) => {
    const val = validationResult?.lines.find((vl) => vl.kind === l.kind && vl.itemId === l.itemId);
    const isAvailable = val ? val.available : true;
    let issueMessage: string | undefined;

    if (val && !val.available) {
      issueMessage = "Sold out";
    }

    return {
      kind: l.kind,
      itemId: l.itemId,
      quantity: l.quantity,
      name: val?.name ?? (l.kind === "set" ? "[Discovery Set]" : "[Fragrance]"),
      unitPrice: val?.unitPrice ?? { amount: l.kind === "set" ? 400000 : 150000, currency: "KES" },
      available: isAvailable,
      issueMessage,
    };
  });

  const subtotalAmount = displayLines
    .filter((l) => l.available)
    .reduce((sum, l) => sum + l.unitPrice.amount * l.quantity, 0);

  const subtotalMoney = { amount: subtotalAmount, currency: "KES" };
  const hasUnavailableItems = displayLines.some((l) => !l.available);

  return (
    <Sheet open={isOpen} onOpenChange={setDrawerOpen} modal={false}>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="flex h-full w-[88vw] max-w-[420px] data-[side=right]:w-[88vw] data-[side=right]:max-w-[420px] flex-col bg-card p-0 shadow-2xl"
      >
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="text-left text-lg font-medium text-foreground">
            Shopping Cart
          </SheetTitle>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border border-border">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Your cart is empty</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              Discover authentic 10ml fragrance decants and discovery sets.
            </p>
            <Link
              href="/shop"
              onClick={() => closeDrawer()}
              className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse perfumes
            </Link>
          </div>
        ) : (
          <>
            {/* Scrollable item list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" role="list">
              {displayLines.map((line) => {
                const lineTotal = {
                  amount: line.unitPrice.amount * line.quantity,
                  currency: line.unitPrice.currency,
                };
                return (
                  <div
                    key={`${line.kind}-${line.itemId}`}
                    role="listitem"
                    className="flex gap-3 rounded-lg border border-border bg-background/50 p-3"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-card flex items-center justify-center">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        {line.kind === "set" ? "Set" : "10ml"}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="line-clamp-1 text-sm font-medium text-foreground">
                            {line.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {line.kind === "set" ? "Discovery Set (3 decants)" : "10ml decant"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => remove(line.kind, line.itemId)}
                          aria-label={`Remove ${line.name}`}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-card"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      {line.issueMessage && (
                        <p className="text-xs font-medium text-destructive mt-1">
                          {line.issueMessage}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.kind, line.itemId, line.quantity - 1)}
                            aria-label={`Decrease quantity of ${line.name}`}
                            className="inline-flex min-h-11 min-w-10 px-2 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-card/80"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span
                            aria-label={`Quantity: ${line.quantity}`}
                            className="w-6 text-center text-sm font-medium text-foreground"
                          >
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={!line.available || line.quantity >= MAX_LINE_QUANTITY}
                            onClick={() => setQuantity(line.kind, line.itemId, line.quantity + 1)}
                            aria-label={`Increase quantity of ${line.name}`}
                            className="inline-flex min-h-11 min-w-10 px-2 items-center justify-center rounded-md border border-border bg-card text-foreground hover:bg-card/80 disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <div className="text-right shrink-0">
                          <Price money={lineTotal} className="text-sm font-medium text-foreground whitespace-nowrap" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky footer */}
            <div className="border-t border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <Price money={subtotalMoney} className="font-semibold text-foreground text-lg" />
              </div>

              {hasUnavailableItems && (
                <p className="text-xs text-destructive text-center">
                  Please remove sold-out items before proceeding to checkout.
                </p>
              )}

              <div className="flex flex-col gap-2 pt-1">
                {hasUnavailableItems ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
                  >
                    Proceed to checkout
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    onClick={() => closeDrawer()}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Proceed to checkout
                  </Link>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Link
                    href="/cart"
                    onClick={() => closeDrawer()}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground hover:bg-card"
                  >
                    View full cart
                  </Link>
                  <button
                    type="button"
                    onClick={() => closeDrawer()}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-border bg-card/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-card"
                  >
                    Continue shopping
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
