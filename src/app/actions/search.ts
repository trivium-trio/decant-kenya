"use server";

import { getShopApi } from "@/lib/data/api";
import type { SearchSuggestion } from "@/lib/data/types";

export async function getSearchSuggestionsAction(query: string): Promise<SearchSuggestion[]> {
  if (typeof query !== "string") return [];
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return getShopApi().suggestProducts(trimmed, 5);
}
