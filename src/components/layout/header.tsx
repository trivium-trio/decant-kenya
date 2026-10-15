import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="text-lg font-medium">
          {siteConfig.name}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm md:flex">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center hover:text-muted-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/cart" className="inline-flex min-h-11 items-center px-2">
            Cart (0)
          </Link>
          {/* TODO: client component. Hamburger button labeled Menu that opens a shadcn Sheet below md. */}
          <button type="button" className="inline-flex min-h-11 items-center rounded-md border border-border px-4 md:hidden">
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
