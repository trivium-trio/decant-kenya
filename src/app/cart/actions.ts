"use server";

import { getShopApi } from "@/lib/data/api";
import type { CartLine, ValidatedCart } from "@/lib/data/types";

export async function validateCartAction(lines: CartLine[]): Promise<ValidatedCart> {
  if (!Array.isArray(lines)) {
    throw new Error("Invalid cart data: expected an array");
  }

  if (lines.length > 50) {
    throw new Error("Cart exceeds maximum limit of 50 items");
  }

  for (const line of lines) {
    if (!line || typeof line !== "object") {
      throw new Error("Invalid cart line: expected an object");
    }
    if (line.kind !== "product" && line.kind !== "set") {
      throw new Error(`Invalid line kind: ${line.kind}`);
    }
    if (typeof line.itemId !== "string" || !line.itemId.trim()) {
      throw new Error("Invalid itemId: expected non-empty string");
    }
    if (
      typeof line.quantity !== "number" ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 10
    ) {
      throw new Error("Invalid quantity: must be an integer between 1 and 10");
    }
  }

  return await getShopApi().validateCart(lines);
}
