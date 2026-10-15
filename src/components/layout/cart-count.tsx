"use client";

import Link from "next/link";
import { selectCount, useCart } from "@/lib/cart/store";

export function CartCount() {
  const count = useCart(selectCount);

  return (
    <Link
      href="/cart"
      className="inline-flex min-h-11 items-center px-2 hover:text-muted-foreground"
    >
      Cart ({count})
    </Link>
  );
}
