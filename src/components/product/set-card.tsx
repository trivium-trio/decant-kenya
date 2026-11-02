import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/shared/price";
import type { DiscoverySet } from "@/lib/data/types";

export function SetCard({ set }: { set: DiscoverySet }) {
  return (
    <article className="h-full rounded-lg bg-card p-4">
      <Link href={`/sets/${set.slug}`} className="flex flex-col gap-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-background/40">
          {set.image?.src && (
            <Image
              src={set.image.src}
              alt={set.image.alt || set.name}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <h3 className="text-lg font-medium">{set.name}</h3>
        <p className="text-sm text-muted-foreground">{set.description}</p>
        <Price money={set.price} className="font-medium" />
      </Link>
    </article>
  );
}
