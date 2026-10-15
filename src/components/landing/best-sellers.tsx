import { ProductCard } from "@/components/product/product-card";
import { getShopApi } from "@/lib/data/api";

export async function BestSellers() {
  const products = await getShopApi().getBestSellers(4);
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-2xl font-medium">Best sellers</h2>
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
