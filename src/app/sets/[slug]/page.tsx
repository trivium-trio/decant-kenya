import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Price } from "@/components/shared/price";
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
  return { title: result.set.name, description: result.set.description, alternates: { canonical: `/sets/${result.set.slug}` } };
}

export default async function SetPage({ params }: Props) {
  const { slug } = await params;
  const result = await getShopApi().getSet(slug);
  if (!result) notFound();
  const { set, products } = result;
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="text-3xl font-medium tracking-tight">{set.name}</h1>
      <p className="mt-2 text-muted-foreground">{set.description}</p>
      <Price money={set.price} className="mt-4 block text-xl font-medium" />
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {products.map((p) => (
          <li key={p.id} className="rounded-lg bg-card p-4 text-sm">
            {p.brand} {p.name} · 10ml
          </li>
        ))}
      </ul>
      {/* TODO: Add to cart */}
    </main>
  );
}
