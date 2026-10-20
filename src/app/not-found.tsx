import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center md:px-8">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
        <Compass className="size-7" />
      </div>

      <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary">
        404 Error
      </span>

      <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-base text-muted-foreground">
        The fragrance or page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Browse perfumes
        </Link>
        <Link
          href="/sets"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Discovery sets
        </Link>
      </div>
    </main>
  );
}
