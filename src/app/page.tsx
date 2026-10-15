import { BestSellers } from "@/components/landing/best-sellers";
import { DiscoverySets } from "@/components/landing/discovery-sets";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Reviews } from "@/components/landing/reviews";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <DiscoverySets />
      <BestSellers />
      <HowItWorks />
      <Reviews />
    </main>
  );
}
