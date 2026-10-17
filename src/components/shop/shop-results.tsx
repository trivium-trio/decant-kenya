import Link from "next/link";
import Form from "next/form";
import { getShopApi } from "@/lib/data/api";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { parseShopParams, buildShopUrl, type RawSearchParams, type ShopState } from "@/lib/shop/url";
import { SearchFocus } from "@/components/shop/search-focus";
import { ShopFilters } from "@/components/shop/shop-filters";
import type { SortOption } from "@/lib/data/types";

export const SHOP_PAGE_SIZE = 12;

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "price_asc", label: "Price: low to high" },
  { id: "price_desc", label: "Price: high to low" },
  { id: "name", label: "Name" },
];

export function ShopResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search form skeleton */}
      <Skeleton className="min-h-11 w-full rounded-md" />

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        {/* Desktop sidebar skeleton */}
        <div className="hidden md:block w-60 shrink-0 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>

        {/* Main column skeleton */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <Skeleton key={opt.id} className="min-h-11 w-full rounded-md sm:w-36" />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-lg bg-card p-3 md:p-4">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-4 h-11 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function ShopResults({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;
  const state: ShopState = parseShopParams(rawParams);

  const api = getShopApi();
  const [facets, { items, total, page, pageSize }] = await Promise.all([
    api.listFacets(),
    api.listProducts({
      search: state.q,
      brands: state.brands.length > 0 ? state.brands : undefined,
      families: state.families.length > 0 ? state.families : undefined,
      inStockOnly: state.inStock || undefined,
      sort: state.sort,
      page: state.page,
      pageSize: SHOP_PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // FR-12 / SEO hoisted meta tag (Item 14)
  const hasNoindex = Boolean(state.q || state.brands.length > 0 || state.families.length > 0 || state.inStock);

  const hasActiveFilters = state.brands.length > 0 || state.families.length > 0 || state.inStock;

  const resultCountText = total === 0 ? "No perfumes" : total === 1 ? "1 perfume" : `${total} perfumes`;

  return (
    <>
      {hasNoindex && <meta name="robots" content="noindex,follow" />}
      <SearchFocus />

      <div className="space-y-6">
        {/* Search form (FR-4, Item 7) */}
        <Form action="/shop" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="search" className="sr-only">
            Search perfumes
          </label>
          <div className="relative flex-1">
            <input
              id="search"
              type="search"
              name="q"
              defaultValue={state.q ?? ""}
              maxLength={80}
              placeholder="Search perfumes by name or brand..."
              className="flex min-h-11 w-full rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>

          {/* Preserve sort and filters through hidden inputs */}
          {state.sort !== "popular" && <input type="hidden" name="sort" value={state.sort} />}
          {state.inStock && <input type="hidden" name="inStock" value="1" />}
          {state.brands.map((brand) => (
            <input key={`search-brand-${brand}`} type="hidden" name="brand" value={brand} />
          ))}
          {state.families.map((family) => (
            <input key={`search-family-${family}`} type="hidden" name="family" value={family} />
          ))}

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </Form>

        {/* Layout: Sticky sidebar (md+) or bottom Sheet (<md) beside grid */}
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <ShopFilters facets={facets} state={state} />

          <div className="flex-1 min-w-0 space-y-6">
            {/* Sorting nav (FR-13) */}
            <nav aria-label="Sort" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {SORT_OPTIONS.map((opt) => {
                const isActive = state.sort === opt.id;
                return (
                  <Link
                    key={opt.id}
                    href={buildShopUrl(state, { sort: opt.id })}
                    aria-current={isActive ? "true" : undefined}
                    className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-center text-xs font-medium transition sm:text-sm ${
                      isActive
                        ? "border-foreground bg-card text-foreground shadow-sm"
                        : "border-border bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </nav>

            {/* Active filters chips (Item 13) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
                {state.brands.map((brand) => (
                  <Link
                    key={`chip-brand-${brand}`}
                    href={buildShopUrl(state, { brands: state.brands.filter((b) => b !== brand) })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs text-foreground hover:bg-card hover:text-foreground"
                    aria-label={`Remove filter ${brand}`}
                  >
                    <span>{brand}</span>
                    <span aria-hidden="true" className="text-muted-foreground">✕</span>
                  </Link>
                ))}
                {state.families.map((family) => (
                  <Link
                    key={`chip-family-${family}`}
                    href={buildShopUrl(state, { families: state.families.filter((f) => f !== family) })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs text-foreground hover:bg-card hover:text-foreground"
                    aria-label={`Remove filter ${family}`}
                  >
                    <span>{family}</span>
                    <span aria-hidden="true" className="text-muted-foreground">✕</span>
                  </Link>
                ))}
                {state.inStock && (
                  <Link
                    href={buildShopUrl(state, { inStock: false })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs text-foreground hover:bg-card hover:text-foreground"
                    aria-label="Remove filter In stock only"
                  >
                    <span>In stock only</span>
                    <span aria-hidden="true" className="text-muted-foreground">✕</span>
                  </Link>
                )}
                <Link
                  href={buildShopUrl(state, { brands: [], families: [], inStock: false })}
                  className="inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear all
                </Link>
              </div>
            )}

            {/* Result count above the grid (Item 9) */}
            <h2 className="sr-only">Fragrances</h2>
            <p className="text-sm text-muted-foreground">{resultCountText}</p>

            {/* Grid or No-results state (Item 9) */}
            {items.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 md:p-12 text-center">
                <h2 className="text-lg font-medium text-foreground">
                  No perfumes match {state.q ? `"${state.q}"` : "your filters"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search terms or clearing filters to find what you&apos;re looking for.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Clear search and filters
                  </Link>
                  <Link
                    href="/sets"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-card/80"
                  >
                    Discovery sets
                  </Link>
                  <Link
                    href="/shop"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-card/80"
                  >
                    Full shop
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination (FR-11) */}
            {total > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing {startItem} to {endItem} of {total}
                </p>

                <nav aria-label="Pagination" className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={buildShopUrl(state, { page: currentPage - 1 })}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-card/40 px-3 text-sm font-medium text-foreground hover:bg-card"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border/40 bg-card/20 px-3 text-sm font-medium text-muted-foreground/50"
                    >
                      Previous
                    </span>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isCurrent = p === currentPage;
                    return (
                      <Link
                        key={p}
                        href={buildShopUrl(state, { page: p })}
                        aria-current={isCurrent ? "page" : undefined}
                        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-medium transition ${
                          isCurrent
                            ? "border-foreground bg-card text-foreground font-semibold"
                            : "border-border bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}

                  {currentPage < totalPages ? (
                    <Link
                      href={buildShopUrl(state, { page: currentPage + 1 })}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-card/40 px-3 text-sm font-medium text-foreground hover:bg-card"
                    >
                      Next
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border/40 bg-card/20 px-3 text-sm font-medium text-muted-foreground/50"
                    >
                      Next
                    </span>
                  )}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
