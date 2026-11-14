import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Price } from "@/components/shared/price";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import type { Product } from "@/lib/data/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex h-full flex-col justify-between gap-3 rounded-lg bg-card p-3 md:p-4">
      <Link href={`/product/${product.slug}`} className="flex flex-col gap-2">
        <div className="relative aspect-square overflow-hidden rounded-md bg-background/40">
          {product.images && product.images.length > 0 && product.images[0].src ? (
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt || product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : null}
          {product.stock === "out_of_stock" && (
            <span className="absolute left-2 top-2 z-10 rounded border border-border bg-card/90 px-2 py-0.5 text-xs font-medium text-destructive">
              Sold out
            </span>
          )}
          {product.stock === "low_stock" && (
            <span className="absolute left-2 top-2 z-10 rounded border border-border bg-card/90 px-2 py-0.5 text-xs font-medium text-foreground">
              Few left
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 text-base font-medium">{product.name}</h3>
        {product.videoUrl && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
            <Play className="size-3" aria-hidden="true" />
            Watch the review
          </span>
        )}
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
