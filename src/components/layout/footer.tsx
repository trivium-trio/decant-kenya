import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border pb-24 md:pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-8">
        <span className="font-medium">{siteConfig.name}</span>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {siteConfig.footer.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex min-h-11 shrink-0 items-center text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="text-muted-foreground">© {siteConfig.name}</span>
      </div>
    </footer>
  );
}
