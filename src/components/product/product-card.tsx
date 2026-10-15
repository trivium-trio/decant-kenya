import Link from "next/link";
import { Price } from "@/components/shared/price";
import type { Product } from "@/lib/data/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col gap-2 rounded-lg bg-card p-3 md:p-4">
      <Link href={`/product/${product.slug}`} className="flex flex-col gap-2">
        {/* TODO: next/image once real vial photos exist */}
        <div className="aspect-square rounded-md bg-background/40" aria-hidden />
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="text-base font-medium">{product.name}</h3>
      </Link>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">10ml decant</p>
      <Price money={product.price} className="font-medium" />
      {/* TODO: AddToCartButton (client component using useCart and track) */}
    </article>
  );
}
