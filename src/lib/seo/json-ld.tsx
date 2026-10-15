import { siteConfig } from "@/config/site";
import type { Product } from "@/lib/data/types";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const availability = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
} as const;

/** Add review or aggregateRating markup only when real reviews are visible on the page (NFR-22). */
export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: product.brand },
    image: product.images.map((i) => new URL(i.src, siteConfig.url).toString()),
    url: `${siteConfig.url}/product/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: (product.price.amount / 100).toFixed(2),
      priceCurrency: product.price.currency,
      availability: availability[product.stock],
    },
  };
}
