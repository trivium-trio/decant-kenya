"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-[#0e1613] px-5 py-16 text-[#e8eee9] antialiased">
        <main className="flex max-w-md flex-col items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertTriangle className="size-7" />
          </div>

          <h1 className="mt-6 text-3xl font-medium tracking-tight">
            Critical Application Error
          </h1>

          <p className="mt-3 text-sm text-[#94a399]">
            A critical error occurred. Please try reloading the page or return to the storefront.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#25825a] px-6 text-sm font-medium text-[#0e1613] hover:opacity-90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#23352c] bg-[#16231e] px-6 text-sm font-medium text-[#e8eee9] hover:bg-[#1e2f29]"
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
