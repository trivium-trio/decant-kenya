import { Droplets, Sparkles, Layers, PackageCheck } from "lucide-react";

const reasons = [
  {
    icon: Sparkles,
    title: "Premium juice",
    text: "Every drop is drawn from brand-new, authenticated bottles with verified batch codes.",
  },
  {
    icon: Droplets,
    title: "Low commitment",
    text: "A 10ml vial gives you 120–150 sprays — enough for a full month — without the full-bottle price.",
  },
  {
    icon: Layers,
    title: "Variety",
    text: "Explore different houses and scent families without committing to one bottle.",
  },
  {
    icon: PackageCheck,
    title: "Convenience",
    text: "Pocket-sized, leak-proof atomizers delivered to your door across Kenya.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-card" aria-labelledby="why-decants-heading">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <h2 id="why-decants-heading" className="text-2xl font-medium tracking-tight">
          Why decants?
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <li key={r.title} className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <r.icon className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-medium">{r.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
