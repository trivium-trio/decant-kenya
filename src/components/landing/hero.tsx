import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-12 md:px-8 md:py-16">
      <div className="flex flex-col items-start gap-5">
        <h1 className="text-4xl font-medium leading-tight tracking-tight md:text-5xl">Try it first. Love it. Own it.</h1>
        <p className="max-w-md text-base text-muted-foreground">[One sentence: authentic 10ml decants, delivered to you]</p>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/sets" className="inline-flex min-h-11 items-center rounded-md bg-primary px-7 text-sm font-medium text-primary-foreground">
            Shop discovery sets
          </Link>
          <Link href="/how-it-works" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">
            How it works
          </Link>
        </div>
      </div>
      {/* TODO: hero image (vials + bottle), next/image with priority */}
      <div className="aspect-[4/3] rounded-md bg-card" aria-hidden />
    </section>
  );
}
