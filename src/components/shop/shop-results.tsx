import Link from "next/link";
import { getShopApi } from "@/lib/data/api";
import { ProductCard } from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export const SHOP_PAGE_SIZE = 12;

const VALID_SORTS = ["popular", "price_asc", "price_desc", "name"] as const;
type SortOption = (typeof VALID_SORTS)[number];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "price_asc", label: "Price: low to high" },
  { id: "price_desc", label: "Price: high to low" },
  { id: "name", label: "Name" },
];

export function ShopResultsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Sort skeleton */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {SORT_OPTIONS.map((opt) => (
          <Skeleton key={opt.id} className="min-h-11 w-full rounded-md sm:w-36" />
        ))}
      </div>

      {/* Grid skeleton */}
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
  );
}

export async function ShopResults({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const params = await searchParams;

  // Validate sort
  const rawSort = params.sort as SortOption | undefined;
  const sort: SortOption = rawSort && VALID_SORTS.includes(rawSort) ? rawSort : "popular";

  // Validate page
  const parsedPage = parseInt(params.page ?? "1", 10);
  const requestedPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { items, total, page, pageSize } = await getShopApi().listProducts({
    sort,
    page: requestedPage,
    pageSize: SHOP_PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const getSortHref = (sortId: SortOption) => {
    return `/shop?sort=${sortId}`;
  };

  const getPageHref = (pageNum: number) => {
    const query = new URLSearchParams();
    if (sort !== "popular") {
      query.set("sort", sort);
    }
    if (pageNum > 1) {
      query.set("page", String(pageNum));
    }
    const qs = query.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <div className="space-y-8">
      {/* Sorting nav (FR-13) */}
      <nav aria-label="Sort" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {SORT_OPTIONS.map((opt) => {
          const isActive = sort === opt.id;
          return (
            <Link
              key={opt.id}
              href={getSortHref(opt.id)}
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

      {/* Grid or Empty State (FR-11) */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h2 className="text-lg font-medium text-foreground">No fragrances found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try clearing your filters or changing your sort order.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
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
                href={getPageHref(currentPage - 1)}
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
                  href={getPageHref(p)}
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
                href={getPageHref(currentPage + 1)}
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
  );
}
