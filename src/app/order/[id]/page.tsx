import { Suspense } from "react";
import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false, follow: false } };

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PagePlaceholder title={`Order ${id}`} />;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PagePlaceholder title="Order" />}>
      <OrderContent params={params} />
    </Suspense>
  );
}
