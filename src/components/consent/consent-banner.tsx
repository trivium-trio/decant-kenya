"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useConsent } from "@/lib/consent/store";

export function ConsentBanner() {
  const isHydrated = useSyncExternalStore(
    (callback) => useConsent.persist.onFinishHydration(callback),
    () => useConsent.persist.hasHydrated(),
    () => false,
  );
  const status = useConsent((s) => s.status);
  const setConsent = useConsent((s) => s.setConsent);

  if (!isHydrated || status !== "pending") {
    return null;
  }

  return (
    <aside
      aria-label="Privacy and cookies"
      role="region"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-4 shadow-2xl backdrop-blur md:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            We value your privacy under Kenya&apos;s Data Protection Act, 2019
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            We use essential cookies to maintain your cart and secure checkout. With your permission, we also collect
            anonymous shopping funnel analytics to improve decant recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Learn more in Privacy Policy
          </Link>
          <button
            type="button"
            onClick={() => setConsent("essential_only")}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => setConsent("analytics_granted")}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </aside>
  );
}
