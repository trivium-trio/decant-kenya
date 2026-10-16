"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

export function TrackProductView({ productId }: { productId: string }) {
  useEffect(() => {
    track({ name: "product_viewed", productId });
  }, [productId]);

  return null;
}
