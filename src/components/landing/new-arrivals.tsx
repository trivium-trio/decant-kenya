import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { getShopApi } from "@/lib/data/api";

export async function NewArrivals() {
  const products = await getShopApi().getNewArrivals(4);
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">New arrivals</h2>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
