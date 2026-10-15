import { getShopApi } from "@/lib/data/api";

// Three static reviews, no auto-advancing carousel.
export async function Reviews() {
  const reviews = await getShopApi().listReviews({ limit: 3 });
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
      <p className="rounded-md bg-card px-4 py-4 text-center text-sm text-muted-foreground">[Authenticity badge + line]</p>
      <ul className="mt-6 grid gap-5 md:grid-cols-3">
        {reviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-2 rounded-lg bg-card p-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{review.rating} / 5</span>
            <p className="text-sm">{review.body}</p>
            <p className="text-sm text-muted-foreground">{review.author}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
