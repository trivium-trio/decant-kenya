import type { DiscoverySet, Media, Product, Review } from "../types";

const image = (alt: string): Media => ({ src: "/placeholder-vial.svg", alt, width: 800, height: 1000 });
const price = { amount: 150000, currency: "KES" };

export const products: Product[] = Array.from({ length: 8 }, (_, i): Product => {
  const n = i + 1;
  return {
    id: `p${n}`,
    slug: `sample-perfume-${n}`,
    brand: "[Brand]",
    name: `[Perfume ${n}]`,
    description: "[Scent description]",
    notes: { top: ["[Top note]"], heart: ["[Heart note]"], base: ["[Base note]"] },
    family: n % 2 ? "Woody" : "Fresh",
    images: [image(`[Perfume ${n}] 10ml decant`)],
    price,
    stock: n === 7 ? "out_of_stock" : n === 4 ? "low_stock" : "in_stock",
  };
});

export const sets: DiscoverySet[] = [1, 2, 3].map((n): DiscoverySet => ({
  id: `s${n}`,
  slug: `sample-set-${n}`,
  name: `[Set name ${n}]`,
  description: "[3 decants · what the set is for]",
  productIds: n === 3 ? ["p5", "p6", "p7"] : [`p${n}`, `p${n + 1}`, `p${n + 2}`],
  price: { amount: 400000, currency: "KES" },
  image: image(`[Set ${n}]`),
}));

export const reviews: Review[] = [1, 2, 3].map((n): Review => ({
  id: `r${n}`,
  author: "[Name]",
  rating: 5,
  body: "[Customer review]",
  createdAt: "2026-01-01",
}));
