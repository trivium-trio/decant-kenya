"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrderAction } from "@/app/checkout/actions";
import { Loader2, ShieldCheck } from "lucide-react";

interface PendingOrderPollerProps {
  reference: string;
  token?: string;
  initialStatus: "pending" | "paid" | "failed" | "expired";
}

export function PendingOrderPoller({
  reference,
  token,
  initialStatus,
}: PendingOrderPollerProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const order = await getOrderAction(reference, token);
        if (order && order.paymentStatus !== "pending") {
          setStatus(order.paymentStatus);
          router.refresh();
        }
      } catch {
        // Continue polling on transient errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [reference, token, status, router]);

  if (status !== "pending") {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 text-center space-y-2 animate-pulse"
    >
      <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm sm:text-base">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span>Confirming payment...</span>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
        We are waiting for payment settlement from the gateway. Please keep this window open; this receipt will update automatically once verified.
      </p>
      <div className="pt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>Secure direct gateway verification</span>
      </div>
    </div>
  );
}
