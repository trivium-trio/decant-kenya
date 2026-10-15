import Link from "next/link";
import { Price } from "@/components/shared/price";
import { getShopApi } from "@/lib/data/api";

// No carousel: a grid that stacks on phones (client requirement).
export async function DiscoverySets() {
  const sets = (await getShopApi().listSets()).slice(0, 4);
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-2xl font-medium">Discovery sets</h2>
      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {sets.map((set) => (
          <li key={set.id} className="rounded-lg bg-card p-4">
            <Link href={`/sets/${set.slug}`} className="flex flex-col gap-2">
              <div className="aspect-[4/3] rounded-md bg-background/40" aria-hidden />
              <h3 className="text-lg font-medium">{set.name}</h3>
              <p className="text-sm text-muted-foreground">{set.description}</p>
              <Price money={set.price} className="font-medium" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
