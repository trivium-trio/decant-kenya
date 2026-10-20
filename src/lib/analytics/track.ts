import { trackEventAction } from "@/app/actions/analytics";
import { useConsent } from "@/lib/consent/store";
import type { AnalyticsEventInput } from "@/lib/data/types";

export type AnalyticsEvent =
  | { name: "product_viewed"; productId: string; kind?: "product" | "set" }
  | { name: "add_to_cart"; kind: "product" | "set"; itemId: string; value?: number }
  | { name: "checkout_started" }
  | { name: "checkout_completed"; orderId: string; value?: number }
  | { name: "newsletter_signup" }
  | AnalyticsEventInput;

/**
 * Single entry point for analytics (FR-36, NFR-25, NFR-31).
 * Only fires events when the user has granted analytics consent under Kenya DPA.
 */
export function track(event: AnalyticsEvent): void {
  // Check consent status (NFR-25, NFR-31)
  const consent = useConsent.getState().status;
  if (consent !== "analytics_granted") {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[analytics blocked: no consent]", event);
    }
    return;
  }

  let payload: AnalyticsEventInput;

  if ("event" in event) {
    payload = event;
  } else {
    switch (event.name) {
      case "product_viewed":
        payload = {
          event: "product_view",
          itemKind: event.kind ?? "product",
          itemId: event.productId,
        };
        break;
      case "add_to_cart":
        payload = {
          event: "add_to_cart",
          itemKind: event.kind,
          itemId: event.itemId,
          value: event.value,
          currency: "KES",
        };
        break;
      case "checkout_started":
        payload = {
          event: "checkout_started",
        };
        break;
      case "checkout_completed":
        payload = {
          event: "checkout_completed",
          itemId: event.orderId,
          value: event.value,
          currency: "KES",
        };
        break;
      default:
        return;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", payload);
  }

  // Non-blocking Server Action invocation
  trackEventAction(payload).catch(() => {
    // Analytics failures should never crash the user experience
  });
}

export function trackEvent(event: AnalyticsEventInput): void {
  track(event);
}
