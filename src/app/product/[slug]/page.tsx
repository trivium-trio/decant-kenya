import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { Price } from "@/components/shared/price";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductCard } from "@/components/product/product-card";
import { TrackProductView } from "@/components/product/track-product-view";
import { getShopApi } from "@/lib/data/api";
import { breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { items } = await getShopApi().listProducts({ pageSize: 1000 });
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopApi().getProduct(slug);
  if (!product) return {};
  const canonicalUrl = `/product/${product.slug}`;
  const fullUrl = `${siteConfig.url}${canonicalUrl}`;

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: product.name,
      description: product.description,
      url: fullUrl,
      images: product.images.map((img) => ({
        url: new URL(img.src, siteConfig.url).toString(),
        alt: img.alt,
      })),
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getShopApi().getProduct(slug);
  if (!product) notFound();

  const [reviews, relatedProducts] = await Promise.all([
    getShopApi().listReviews({ productId: product.id }),
    getShopApi().listRelatedProducts(product.id, 4),
  ]);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const isSoldOut = product.stock === "out_of_stock";

  return (
    <>
      <TrackProductView productId={product.id} />
      <JsonLd data={productJsonLd(product, reviews)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Shop", url: `${siteConfig.url}/shop` },
          { name: product.name, url: `${siteConfig.url}/product/${product.slug}` },
        ])}
      />

      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        {/* Breadcrumb (FR-16) */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/shop" className="inline-flex min-h-11 items-center hover:text-foreground">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">&gt;</li>
            <li aria-current="page" className="text-foreground">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* 2-column layout on md+ */}
        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* Image area (aspect 4/5) */}
          <div>
            <div className="flex aspect-[4/5] w-full items-center justify-center rounded-lg border border-border bg-card/60 p-6">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                [Placeholder vial image]
              </span>
            </div>
          </div>

          {/* Details column (sticky on md+) */}
          <div className="md:sticky md:top-24 md:h-fit">
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <h1 className="mt-1 text-3xl font-medium tracking-tight md:text-4xl">{product.name}</h1>
            <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">10ml decant</p>
            <Price money={product.price} className="mt-3 block text-2xl font-medium" />
            <p className="mt-1 text-xs text-muted-foreground">[Authenticity line]</p>

            {/* Stock status text */}
            <p className="mt-3 text-sm font-medium">
              {product.stock === "out_of_stock" && <span className="text-destructive">Sold out</span>}
              {product.stock === "low_stock" && <span className="text-foreground">Few left</span>}
              {product.stock === "in_stock" && <span className="text-muted-foreground">In stock</span>}
            </p>

            {/* Desktop Add to cart button (hidden below md) */}
            <div className="mt-6 hidden md:block">
              <AddToCartButton
                kind="product"
                itemId={product.id}
                name={product.name}
                unavailable={isSoldOut}
              />
            </div>

            {/* Scent notes (FR-17) */}
            <section aria-label="Fragrance notes" className="mt-8 border-t border-border pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fragrance notes
              </h2>
              <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top</dt>
                  <dd className="mt-1 text-foreground">{product.notes.top.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Heart</dt>
                  <dd className="mt-1 text-foreground">{product.notes.heart.join(", ")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Base</dt>
                  <dd className="mt-1 text-foreground">{product.notes.base.join(", ")}</dd>
                </div>
              </dl>
            </section>

            {/* Description */}
            <section aria-label="Description" className="mt-6 border-t border-border pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </section>

            {/* TODO: full-bottle prompt (FR-20, later phase) */}

            {/* Reviews (FR-18) */}
            <section aria-label="Customer reviews" className="mt-8 border-t border-border pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No reviews yet</p>
              ) : (
                <div className="mt-3 space-y-4">
                  <p className="text-sm font-medium text-foreground">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"} ({avgRating} ★)
                  </p>
                  <ul className="space-y-3">
                    {reviews.map((r) => (
                      <li key={r.id} className="rounded-lg bg-card/60 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{r.author}</span>
                          <span className="text-xs text-muted-foreground">★ {r.rating} / 5</span>
                        </div>
                        <p className="mt-1 text-muted-foreground">{r.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Similar scents (FR-19) */}
        {relatedProducts.length > 0 && (
          <section aria-labelledby="similar-scents-heading" className="mt-16 border-t border-border pt-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 id="similar-scents-heading" className="text-xl font-medium tracking-tight text-foreground">
                Similar scents
              </h2>
              <Link
                href="/shop"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky Add to cart bar (NFR-34, hidden on md+) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">10ml decant</span>
            <Price money={product.price} className="text-lg font-medium" />
          </div>
          <div className="w-44">
            <AddToCartButton
              kind="product"
              itemId={product.id}
              name={product.name}
              unavailable={isSoldOut}
            />
          </div>
        </div>
      </div>
    </>
  );
}
