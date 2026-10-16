import type { Metadata } from "next";
import { SetCard } from "@/components/product/set-card";
import { getShopApi } from "@/lib/data/api";

export const metadata: Metadata = {
  title: "Discovery sets",
  description: "Curated 3-fragrance discovery sets in authentic 10ml vials. Try first, love it, own it.",
  alternates: { canonical: "/sets" },
};

export default async function SetsPage() {
  const sets = await getShopApi().listSets();

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <h1 className="text-3xl font-medium tracking-tight">Discovery sets</h1>
      <p className="mt-2 text-muted-foreground">
        Each discovery set includes three 10ml decants to experience how scents wear over time.
      </p>

      <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => (
          <li key={set.id}>
            <SetCard set={set} />
          </li>
        ))}
      </ul>
    </main>
  );
}
