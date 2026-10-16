import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Price } from "@/components/shared/price";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { getShopApi } from "@/lib/data/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const sets = await getShopApi().listSets();
  return sets.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getShopApi().getSet(slug);
  if (!result) return {};
  return {
    title: result.set.name,
    description: result.set.description,
    alternates: { canonical: `/sets/${result.set.slug}` },
  };
}

export default async function SetPage({ params }: Props) {
  const { slug } = await params;
  const result = await getShopApi().getSet(slug);
  if (!result) notFound();
  const { set, products } = result;

  const soldOutProduct = products.find((p) => p.stock === "out_of_stock");
  const isUnavailable = Boolean(soldOutProduct);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <h1 className="text-3xl font-medium tracking-tight md:text-4xl">{set.name}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{set.description}</p>
      <Price money={set.price} className="mt-4 block text-2xl font-medium" />

      <section aria-label="Included decants" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Included fragrances (10ml each)
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/product/${p.slug}`}
                className="flex min-h-11 flex-col justify-center rounded-lg bg-card p-4 transition hover:bg-accent hover:text-accent-foreground"
              >
                <span className="text-xs text-muted-foreground">{p.brand}</span>
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">10ml decant</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 max-w-xs">
        <AddToCartButton
          kind="set"
          itemId={set.id}
          name={set.name}
          unavailable={isUnavailable}
        />
        {isUnavailable && (
          <p className="mt-2 text-xs font-medium text-destructive">
            This set is currently unavailable because {soldOutProduct?.name} is sold out.
          </p>
        )}
      </div>
    </main>
  );
}
