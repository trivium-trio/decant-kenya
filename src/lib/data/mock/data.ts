import type { DiscoverySet, Media, Product, Review } from "../types";

const image = (alt: string): Media => ({ src: "/placeholder-vial.svg", alt, width: 800, height: 1000 });
const price = { amount: 150000, currency: "KES" };

const BRANDS = ["[Brand A]", "[Brand B]", "[Brand C]"] as const;
const FAMILIES = ["Woody", "Fresh", "Floral", "Amber"] as const;

export const products: Product[] = Array.from({ length: 14 }, (_, i): Product => {
  const n = i + 1;
  return {
    id: `p${n}`,
    slug: `sample-perfume-${n}`,
    brand: BRANDS[i % BRANDS.length],
    name: `[Perfume ${n}]`,
    description: "[Scent description]",
    notes: { top: ["[Top note]"], heart: ["[Heart note]"], base: ["[Base note]"] },
    family: FAMILIES[i % FAMILIES.length],
    images: [image(`[Perfume ${n}] 10ml decant`)],
    price: n === 14 ? { amount: 90000, currency: "KES" } : price,
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

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "p1",
    author: "[Name]",
    rating: 5,
    body: "[Customer review]",
    createdAt: "2026-01-01",
  },
  {
    id: "r2",
    productId: "p1",
    author: "[Name]",
    rating: 5,
    body: "[Customer review]",
    createdAt: "2026-01-02",
  },
  {
    id: "r3",
    productId: "p2",
    author: "[Name]",
    rating: 5,
    body: "[Customer review]",
    createdAt: "2026-01-03",
  },
];
