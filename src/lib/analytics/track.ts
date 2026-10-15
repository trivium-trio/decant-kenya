export type AnalyticsEvent =
  | { name: "product_viewed"; productId: string }
  | { name: "add_to_cart"; kind: "product" | "set"; itemId: string }
  | { name: "checkout_started" }
  | { name: "checkout_completed"; orderId: string }
  | { name: "newsletter_signup" };

/** Single entry point for analytics (FR-36). Does nothing until a provider and consent handling are chosen. */
export function track(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event);
}
