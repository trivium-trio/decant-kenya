import Link from "next/link";
import { siteConfig } from "@/config/site";
import { CartCount } from "@/components/layout/cart-count";
import { MobileMenu } from "@/components/layout/mobile-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center text-lg font-medium">
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
          <CartCount />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
