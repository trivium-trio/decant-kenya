import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/lib/data/types";

export const MAX_LINE_QUANTITY = 10;

interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (kind: CartLine["kind"], itemId: string, quantity: number) => void;
  remove: (kind: CartLine["kind"], itemId: string) => void;
  clear: () => void;
}

const matches = (l: CartLine, kind: CartLine["kind"], itemId: string) =>
  l.kind === kind && l.itemId === itemId;

export function sanitizeLines(rawLines: unknown): CartLine[] {
  if (!Array.isArray(rawLines)) return [];
  const valid: CartLine[] = [];
  for (const item of rawLines) {
    if (!item || typeof item !== "object") continue;
    const { kind, itemId, quantity } = item as Record<string, unknown>;
    if (kind !== "product" && kind !== "set") continue;
    if (typeof itemId !== "string" || !itemId.trim()) continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) continue;
    const clampedQty = Math.min(Math.max(1, quantity), MAX_LINE_QUANTITY);
    valid.push({ kind, itemId, quantity: clampedQty });
  }
  return valid;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const qty = Math.min(Math.max(1, line.quantity), MAX_LINE_QUANTITY);
          const existing = s.lines.find((l) => matches(l, line.kind, line.itemId));
          if (existing) {
            const nextQty = Math.min(existing.quantity + qty, MAX_LINE_QUANTITY);
            return {
              lines: s.lines.map((l) =>
                matches(l, line.kind, line.itemId) ? { ...l, quantity: nextQty } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, quantity: qty }] };
        }),
      setQuantity: (kind, itemId, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => !matches(l, kind, itemId))
              : s.lines.map((l) =>
                  matches(l, kind, itemId)
                    ? { ...l, quantity: Math.min(quantity, MAX_LINE_QUANTITY) }
                    : l,
                ),
        })),
      remove: (kind, itemId) =>
        set((s) => ({ lines: s.lines.filter((l) => !matches(l, kind, itemId)) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "decant-cart",
      version: 1,
      storage: createJSONStorage(() => {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            return {
              getItem: (key: string) => {
                try {
                  const val = window.localStorage.getItem(key);
                  if (!val || val.trim() === "") return null;
                  return val;
                } catch {
                  return null;
                }
              },
              setItem: (key: string, value: string) => {
                window.localStorage.setItem(key, value);
              },
              removeItem: (key: string) => {
                window.localStorage.removeItem(key);
              },
            };
          }
        } catch {
          // localStorage disabled or blocked
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ lines: state.lines }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.lines = sanitizeLines(state.lines);
        }
      },
      migrate: (persistedState) => {
        const state = persistedState as { lines?: unknown };
        return {
          lines: sanitizeLines(state?.lines),
        };
      },
    },
  ),
);

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
