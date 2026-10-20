"use client";

import { useConsent } from "@/lib/consent/store";

export function CookiePreferencesTrigger({ className }: { className?: string }) {
  const resetConsent = useConsent((s) => s.resetConsent);

  return (
    <button
      type="button"
      onClick={() => {
        resetConsent();
      }}
      className={
        className ??
        "inline-flex min-h-11 shrink-0 items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      Manage cookie preferences
    </button>
  );
}
