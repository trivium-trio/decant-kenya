import { Suspense } from "react";
import { BestSellers } from "@/components/landing/best-sellers";
import { DiscoverySets } from "@/components/landing/discovery-sets";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { NewArrivals } from "@/components/landing/new-arrivals";
import { Reviews } from "@/components/landing/reviews";
import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";
import { Skeleton } from "@/components/ui/skeleton";

function SectionSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <Skeleton className="h-7 w-40" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-lg bg-card p-3 md:p-4">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-4 h-11 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <main>
        <Hero />
        <Suspense fallback={<SectionSkeleton />}>
          <DiscoverySets />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <NewArrivals />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <BestSellers />
        </Suspense>
        <HowItWorks />
        <Suspense fallback={<SectionSkeleton />}>
          <Reviews />
        </Suspense>
      </main>
    </>
  );
}
