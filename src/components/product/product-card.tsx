import Link from "next/link";
import { Price } from "@/components/shared/price";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import type { Product } from "@/lib/data/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col justify-between gap-3 rounded-lg bg-card p-3 md:p-4">
      <Link href={`/product/${product.slug}`} className="flex flex-col gap-2">
        {/* TODO: next/image once real vial photos exist */}
        <div className="aspect-square rounded-md bg-background/40" aria-hidden />
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 text-base font-medium">{product.name}</h3>
      </Link>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">10ml decant</p>
        <Price money={product.price} className="font-medium" />
        <AddToCartButton
          kind="product"
          itemId={product.id}
          name={product.name}
          unavailable={product.stock === "out_of_stock"}
        />
      </div>
    </article>
  );
}
