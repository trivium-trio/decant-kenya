import { SetCard } from "@/components/product/set-card";
import { getShopApi } from "@/lib/data/api";

// No carousel: a grid that stacks on phones (client requirement).
export async function DiscoverySets() {
  const sets = (await getShopApi().listSets()).slice(0, 4);
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-2xl font-medium">Discovery sets</h2>
      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {sets.map((set) => (
          <li key={set.id}>
            <SetCard set={set} />
          </li>
        ))}
      </ul>
    </section>
  );
}
