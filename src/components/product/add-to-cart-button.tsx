"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";
import { track } from "@/lib/analytics/track";
import { toast } from "sonner";
import type { CartItemKind } from "@/lib/data/types";

export interface AddToCartButtonProps {
  kind: CartItemKind;
  itemId: string;
  name: string;
  unavailable?: boolean;
}

export function AddToCartButton({ kind, itemId, name, unavailable = false }: AddToCartButtonProps) {
  const add = useCart((s) => s.add);
  const openDrawer = useCart((s) => s.openDrawer);

  const handleAddToCart = () => {
    if (unavailable) return;
    add({ kind, itemId, quantity: 1 });
    openDrawer();
    track({ name: "add_to_cart", kind, itemId });
    toast("Added to cart");
  };

  const unavailableLabel = kind === "set" ? "Currently unavailable" : "Sold out";

  return (
    <Button
      type="button"
      onClick={handleAddToCart}
      disabled={unavailable}
      className="mt-auto min-h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
    >
      {unavailable ? (
        unavailableLabel
      ) : (
        <>
          Add to cart <span className="sr-only">({name})</span>
        </>
      )}
    </Button>
  );
}
