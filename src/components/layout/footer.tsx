import Link from "next/link";
import { siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function Footer() {
  return (
    <footer className="border-t border-border pb-24 md:pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        {/* Top footer row: brand info + newsletter */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <span className="text-lg font-medium tracking-tight text-foreground">
              {siteConfig.name}
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Authentic 10ml fragrance decants and discovery sets, hand-decanted and delivered nationwide across Kenya. Try it first, love it, own it.
            </p>
          </div>

          <NewsletterForm />
        </div>

        {/* Bottom footer row: navigation links + copyright */}
        <div className="mt-12 flex flex-col gap-6 border-t border-border pt-8 text-sm md:flex-row md:items-center md:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {siteConfig.footer.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="text-xs text-muted-foreground">
            © {siteConfig.name}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
