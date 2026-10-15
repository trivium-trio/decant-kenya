"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          aria-label="Open menu"
        >
          Menu
        </SheetTrigger>
        <SheetContent
          side="right"
          aria-describedby={undefined}
          className="flex flex-col gap-6 overflow-y-auto bg-card p-6"
        >
          <SheetHeader>
            <SheetTitle className="text-left text-lg font-medium text-foreground">Menu</SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile navigation" className="flex flex-col">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-base font-medium hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col border-t border-border pt-4">
            {siteConfig.footer.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
