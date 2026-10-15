import type { Money } from "@/lib/data/types";

// TODO: take the locale from the client's market once it is confirmed.
export function Price({ money, className }: { money: Money; className?: string }) {
  const text = new Intl.NumberFormat("en", { style: "currency", currency: money.currency }).format(money.amount / 100);
  return <span className={className}>{text}</span>;
}
