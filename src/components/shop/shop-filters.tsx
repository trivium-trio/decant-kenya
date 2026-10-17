"use client";

import { useState } from "react";
import Form from "next/form";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buildShopUrl, type ShopState } from "@/lib/shop/url";

interface ShopFiltersProps {
  facets: {
    brands: string[];
    families: string[];
  };
  state: ShopState;
}

export function ShopFilters({ facets, state }: ShopFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount =
    state.brands.length + state.families.length + (state.inStock ? 1 : 0);
  const clearAllHref = buildShopUrl(state, {
    brands: [],
    families: [],
    inStock: false,
  });

  const renderFilterFields = (prefix: string) => (
    <div className="space-y-6">
      {/* Hidden inputs to preserve q and sort without page */}
      {state.q && <input type="hidden" name="q" value={state.q} />}
      {state.sort !== "popular" && (
        <input type="hidden" name="sort" value={state.sort} />
      )}

      {/* Brand fieldset */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Brand</legend>
        <div className="space-y-1">
          {facets.brands.map((brand) => {
            const id = `${prefix}-brand-${brand.replace(/[^a-zA-Z0-9]/g, "-")}`;
            return (
              <label
                key={brand}
                htmlFor={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground select-none"
              >
                <input
                  id={id}
                  type="checkbox"
                  name="brand"
                  value={brand}
                  defaultChecked={state.brands.includes(brand)}
                  className="h-4 w-4 rounded border-border bg-card accent-primary"
                />
                <span>{brand}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Scent family fieldset */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Scent family
        </legend>
        <div className="space-y-1">
          {facets.families.map((family) => {
            const id = `${prefix}-family-${family.replace(/[^a-zA-Z0-9]/g, "-")}`;
            return (
              <label
                key={family}
                htmlFor={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground select-none"
              >
                <input
                  id={id}
                  type="checkbox"
                  name="family"
                  value={family}
                  defaultChecked={state.families.includes(family)}
                  className="h-4 w-4 rounded border-border bg-card accent-primary"
                />
                <span>{family}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* In stock only checkbox */}
      <div className="border-t border-border pt-4">
        <label
          htmlFor={`${prefix}-instock`}
          className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground select-none"
        >
          <input
            id={`${prefix}-instock`}
            type="checkbox"
            name="inStock"
            value="1"
            defaultChecked={state.inStock}
            className="h-4 w-4 rounded border-border bg-card accent-primary"
          />
          <span>In stock only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filters button and bottom Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-card/60 px-4 py-2 text-sm font-medium hover:bg-card hover:text-foreground"
          >
            {activeCount > 0 ? `Filters (${activeCount})` : "Filters"}
          </SheetTrigger>
          <SheetContent
            side="bottom"
            aria-describedby={undefined}
            className="flex max-h-[85dvh] flex-col overflow-hidden bg-card p-0"
          >
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="text-left text-lg font-medium text-foreground">
                Filters
              </SheetTitle>
            </SheetHeader>
            <Form
              action="/shop"
              onSubmit={() => setOpen(false)}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-4">
                {renderFilterFields("mobile")}
              </div>
              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-card p-4">
                <button
                  type="submit"
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Apply filters
                </button>
                <Link
                  href={clearAllHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  Clear all
                </Link>
              </div>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:block w-60 shrink-0 sticky top-24 self-start">
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <h2 className="mb-4 text-base font-medium text-foreground">Filters</h2>
          <Form action="/shop" className="space-y-6">
            {renderFilterFields("desktop")}
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Apply filters
              </button>
              <Link
                href={clearAllHref}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground"
              >
                Clear all
              </Link>
            </div>
          </Form>
        </div>
      </aside>
    </>
  );
}
