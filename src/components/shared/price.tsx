import type { Money } from "@/lib/data/types";

export function Price({ money, className }: { money: Money; className?: string }) {
  const text = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: money.currency || "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(money.amount / 100);
  return <span className={className}>{text}</span>;
}
