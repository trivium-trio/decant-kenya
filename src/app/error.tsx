"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:px-8">
      <h1 className="text-3xl font-medium tracking-tight">Something went wrong</h1>
      <button type="button" onClick={reset} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground">
        Try again
      </button>
    </main>
  );
}
