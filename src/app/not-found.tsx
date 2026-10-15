import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1 className="text-3xl font-medium tracking-tight">Page not found</h1>
      <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground">
        Back to shopping
      </Link>
    </main>
  );
}
