"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Error caught by boundary:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center md:px-8">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="size-7" />
      </div>

      <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-destructive">
        Notice
      </span>

      <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Something went wrong
      </h1>

      <p className="mt-3 max-w-md text-base text-muted-foreground">
        We encountered an unexpected issue while loading this page. Please try again or return to our fragrance catalogue.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try again
        </button>
        <Link
          href="/shop"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Browse perfumes
        </Link>
      </div>
    </main>
  );
}
