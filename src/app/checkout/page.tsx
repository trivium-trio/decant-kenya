import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function Page() {
  return <PagePlaceholder title="Checkout" />;
}
