import { create } from "zustand";
import type { CartLine } from "@/lib/data/types";

interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (kind: CartLine["kind"], itemId: string, quantity: number) => void;
  remove: (kind: CartLine["kind"], itemId: string) => void;
  clear: () => void;
}

const matches = (l: CartLine, kind: CartLine["kind"], itemId: string) => l.kind === kind && l.itemId === itemId;

// TODO (FR-24): persist across reloads (zustand "persist" with skipHydration, rehydrated in a client effect to avoid SSR mismatch).
export const useCart = create<CartState>()((set) => ({
  lines: [],
  add: (line) =>
    set((s) =>
      s.lines.some((l) => matches(l, line.kind, line.itemId))
        ? { lines: s.lines.map((l) => (matches(l, line.kind, line.itemId) ? { ...l, quantity: l.quantity + line.quantity } : l)) }
        : { lines: [...s.lines, line] },
    ),
  setQuantity: (kind, itemId, quantity) =>
    set((s) => ({
      lines:
        quantity <= 0
          ? s.lines.filter((l) => !matches(l, kind, itemId))
          : s.lines.map((l) => (matches(l, kind, itemId) ? { ...l, quantity } : l)),
    })),
  remove: (kind, itemId) => set((s) => ({ lines: s.lines.filter((l) => !matches(l, kind, itemId)) })),
  clear: () => set({ lines: [] }),
}));

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.quantity, 0);
