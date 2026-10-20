"use server";

import { getShopApi } from "@/lib/data/api";
import type { FormSubmitResult } from "@/lib/data/types";

export async function subscribeNewsletterAction(email: string): Promise<FormSubmitResult> {
  const trimmed = email?.trim() ?? "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
    };
  }

  try {
    return await getShopApi().subscribeNewsletter({ email: trimmed });
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to subscribe. Please try again.",
    };
  }
}
