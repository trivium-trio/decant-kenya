"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function TrackProductView({
  productId,
  kind = "product",
}: {
  productId: string;
  kind?: "product" | "set";
}) {
  useEffect(() => {
    track({ name: "product_viewed", productId, kind });
  }, [productId, kind]);

  return null;
}
