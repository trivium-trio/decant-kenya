import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopResults, ShopResultsSkeleton } from "@/components/shop/shop-results";

import type { RawSearchParams } from "@/lib/shop/url";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our curated collection of 10ml fragrance decants.",
  alternates: {
    canonical: "/shop",
  },
};

export default function ShopPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">Shop</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Browse our curated collection of authentic 10ml fragrance decants. Try first, love it, own it.
        </p>
      </header>

      <Suspense fallback={<ShopResultsSkeleton />}>
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
