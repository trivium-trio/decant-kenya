"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";
import { track } from "@/lib/analytics/track";
import { toast } from "sonner";
import type { Product } from "@/lib/data/types";

export function AddToCartButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const isOutOfStock = product.stock === "out_of_stock";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    add({ kind: "product", itemId: product.id, quantity: 1 });
    track({ name: "add_to_cart", kind: "product", itemId: product.id });
    toast("Added to cart");
  };

  return (
    <Button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      className="mt-auto min-h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
    >
      {isOutOfStock ? "Sold out" : "Add to cart"}
    </Button>
  );
}
