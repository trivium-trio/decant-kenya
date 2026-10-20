"use client";

import { selectCount, useCart } from "@/lib/cart/store";

export function CartCount() {
  const count = useCart(selectCount);
  const openDrawer = useCart((s) => s.openDrawer);

  return (
    <a
      href="/cart"
      onClick={(e) => {
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
          e.preventDefault();
          openDrawer();
        }
      }}
      className="inline-flex min-h-11 items-center px-2 hover:text-muted-foreground"
      aria-label={`Cart, ${count} items`}
    >
      Cart ({count})
    </a>
  );
}
