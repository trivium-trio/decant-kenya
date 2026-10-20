"use server";

import { getShopApi } from "@/lib/data/api";
import type { AnalyticsEventInput, ConsentChoice } from "@/lib/data/types";

export async function recordConsentAction(choice: ConsentChoice): Promise<void> {
  if (typeof choice?.analytics !== "boolean") {
    throw new Error("Invalid consent payload");
  }
  return getShopApi().recordConsent(choice);
}

export async function trackEventAction(event: AnalyticsEventInput): Promise<void> {
  if (!event || !event.event) {
    throw new Error("Invalid analytics event payload");
  }
  return getShopApi().trackEvent(event);
}
