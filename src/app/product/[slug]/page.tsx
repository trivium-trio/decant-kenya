import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Price } from "@/components/shared/price";
import { getShopApi } from "@/lib/data/api";
import { JsonLd, productJsonLd } from "@/lib/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { items } = await getShopApi().listProducts({ pageSize: 1000 });
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopApi().getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.description, alternates: { canonical: `/product/${product.slug}` } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getShopApi().getProduct(slug);
  if (!product) notFound();
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <JsonLd data={productJsonLd(product)} />
      <p className="text-sm text-muted-foreground">{product.brand}</p>
      <h1 className="text-3xl font-medium tracking-tight">{product.name}</h1>
      <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">10ml decant</p>
      <Price money={product.price} className="mt-4 block text-xl font-medium" />
      {/* TODO: gallery, notes, description, sticky Add to cart on mobile (NFR-34), reviews, full-bottle prompt (later phase) */}
    </main>
  );
}
