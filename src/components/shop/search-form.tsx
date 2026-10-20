"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSearchSuggestionsAction } from "@/app/actions/search";
import { Price } from "@/components/shared/price";
import type { SearchSuggestion, SortOption } from "@/lib/data/types";

interface SearchFormProps {
  initialQuery?: string;
  sort?: SortOption;
  inStock?: boolean;
  brands?: string[];
  families?: string[];
}

export function SearchForm({
  initialQuery = "",
  sort = "popular",
  inStock = false,
  brands = [],
  families = [],
}: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  if (prevInitialQuery !== initialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions with debounce (150-200ms)
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          const results = await getSearchSuggestionsAction(trimmed);
          setSuggestions(results);
          setIsOpen(results.length > 0);
        } catch {
          setSuggestions([]);
          setIsOpen(false);
        }
      });
    }, 180);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsOpen(false);

    const params = new URLSearchParams();
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    if (sort !== "popular") params.set("sort", sort);
    if (inStock) params.set("inStock", "1");
    brands.forEach((b) => params.append("brand", b));
    families.forEach((f) => params.append("family", f));

    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <form
        action="/shop"
        method="GET"
        role="search"
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label htmlFor="search" className="sr-only">
          Search perfumes
        </label>
        <div className="relative flex-1">
          <input
            id="search"
            type="search"
            name="q"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2 && suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen && suggestions.length > 0}
            aria-controls="search-suggestions-listbox"
            maxLength={80}
            placeholder="Search perfumes by name or brand..."
            className="flex min-h-11 w-full rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />

          {/* Instant suggestions listbox (FR-14) */}
          {isOpen && suggestions.length > 0 && (
            <ul
              id="search-suggestions-listbox"
              role="listbox"
              aria-label="Search suggestions"
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-md border border-border bg-card shadow-xl"
            >
              {suggestions.map((suggestion) => (
                <li key={suggestion.id} role="presentation">
                  <Link
                    role="option"
                    aria-selected="false"
                    href={`/product/${suggestion.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center justify-between border-b border-border/50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/70 focus:bg-muted/70 focus:outline-none"
                  >
                    <div className="flex flex-col pr-4">
                      <span className="text-sm font-medium text-foreground">{suggestion.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {suggestion.brand}
                        {suggestion.family ? ` · ${suggestion.family}` : ""}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Price money={{ amount: suggestion.price, currency: "KES" }} className="text-sm font-medium" />
                      {!suggestion.inStock && (
                        <span className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                          Sold out
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Hidden inputs to preserve existing filters when submitting regular form */}
        {sort !== "popular" && <input type="hidden" name="sort" value={sort} />}
        {inStock && <input type="hidden" name="inStock" value="1" />}
        {brands.map((brand) => (
          <input key={`search-brand-${brand}`} type="hidden" name="brand" value={brand} />
        ))}
        {families.map((family) => (
          <input key={`search-family-${family}`} type="hidden" name="family" value={family} />
        ))}

        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>
    </div>
  );
}
