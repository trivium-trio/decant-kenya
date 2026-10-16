import type { SortOption } from "@/lib/data/types";

export const VALID_SORTS: readonly SortOption[] = ["popular", "price_asc", "price_desc", "name"] as const;

export interface ShopState {
  q?: string;
  sort: SortOption;
  page: number;
  brands: string[];
  families: string[];
  inStock: boolean;
}

export type RawSearchParams =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | { get(name: string): string | null; getAll(name: string): string[] };

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function parseShopParams(raw: RawSearchParams): ShopState {
  const getValues = (key: string): string[] => {
    if (raw && typeof (raw as { getAll?: unknown }).getAll === "function") {
      return (raw as { getAll(name: string): string[] }).getAll(key);
    }
    const val = (raw as Record<string, string | string[] | undefined>)[key];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return [val];
    return [];
  };

  const getFirst = (key: string): string | undefined => {
    if (raw && typeof (raw as { get?: unknown }).get === "function") {
      return (raw as { get(name: string): string | null }).get(key) ?? undefined;
    }
    const val = (raw as Record<string, string | string[] | undefined>)[key];
    if (Array.isArray(val)) return val[0];
    if (typeof val === "string") return val;
    return undefined;
  };

  // q: trimmed and limited to 80 characters
  const rawQ = getFirst("q")?.trim();
  const q = rawQ ? rawQ.slice(0, 80) : undefined;

  // sort: validated as one of popular, price_asc, price_desc, name (else popular)
  const rawSort = getFirst("sort") as SortOption | undefined;
  const sort: SortOption = rawSort && VALID_SORTS.includes(rawSort) ? rawSort : "popular";

  // page: positive integer, else 1
  const rawPage = parseInt(getFirst("page") ?? "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  // brand: repeated params, deduplicated, each at most 60 characters and at most 10 total
  const rawBrands = getValues("brand");
  const seenBrands = new Set<string>();
  const brands: string[] = [];
  for (const b of rawBrands) {
    const trimmed = b.trim();
    if (trimmed && !seenBrands.has(trimmed)) {
      seenBrands.add(trimmed);
      brands.push(trimmed.slice(0, 60));
      if (brands.length >= 10) break;
    }
  }

  // family: repeated params, deduplicated, each at most 60 characters and at most 10 total
  const rawFamilies = getValues("family");
  const seenFamilies = new Set<string>();
  const families: string[] = [];
  for (const f of rawFamilies) {
    const trimmed = f.trim();
    if (trimmed && !seenFamilies.has(trimmed)) {
      seenFamilies.add(trimmed);
      families.push(trimmed.slice(0, 60));
      if (families.length >= 10) break;
    }
  }

  // inStock: true only for "1"
  const inStock = getFirst("inStock") === "1";

  return {
    q,
    sort,
    page,
    brands,
    families,
    inStock,
  };
}

export function buildShopUrl(state: ShopState, overrides: Partial<ShopState> = {}): string {
  const merged: ShopState = {
    q: overrides.q !== undefined ? overrides.q : state.q,
    sort: overrides.sort !== undefined ? overrides.sort : state.sort,
    page: overrides.page !== undefined ? overrides.page : state.page,
    brands: overrides.brands !== undefined ? overrides.brands : state.brands,
    families: overrides.families !== undefined ? overrides.families : state.families,
    inStock: overrides.inStock !== undefined ? overrides.inStock : state.inStock,
  };

  // Any change to q, sort or the filters resets page to 1 unless page was explicitly overridden
  const isQChanged = overrides.q !== undefined && overrides.q !== state.q;
  const isSortChanged = overrides.sort !== undefined && overrides.sort !== state.sort;
  const isInStockChanged = overrides.inStock !== undefined && overrides.inStock !== state.inStock;
  const isBrandsChanged = overrides.brands !== undefined && !arraysEqual(overrides.brands, state.brands);
  const isFamiliesChanged = overrides.families !== undefined && !arraysEqual(overrides.families, state.families);

  if (
    (isQChanged || isSortChanged || isInStockChanged || isBrandsChanged || isFamiliesChanged) &&
    overrides.page === undefined
  ) {
    merged.page = 1;
  }

  // Stable parameter order:
  // 1. q
  // 2. brand
  // 3. family
  // 4. inStock
  // 5. sort
  // 6. page
  const params = new URLSearchParams();

  if (merged.q && merged.q.trim()) {
    params.set("q", merged.q.trim());
  }

  for (const brand of merged.brands) {
    params.append("brand", brand);
  }

  for (const family of merged.families) {
    params.append("family", family);
  }

  if (merged.inStock) {
    params.set("inStock", "1");
  }

  if (merged.sort && merged.sort !== "popular") {
    params.set("sort", merged.sort);
  }

  if (merged.page && merged.page > 1) {
    params.set("page", String(merged.page));
  }

  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
