import { BestSellers } from "@/components/landing/best-sellers";
import { DiscoverySets } from "@/components/landing/discovery-sets";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { NewArrivals } from "@/components/landing/new-arrivals";
import { Reviews } from "@/components/landing/reviews";
import { JsonLd, organizationJsonLd } from "@/lib/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <main>
        <Hero />
        <DiscoverySets />
        <NewArrivals />
        <BestSellers />
        <HowItWorks />
        <Reviews />
      </main>
    </>
  );
}
