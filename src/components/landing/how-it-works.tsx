const steps = [
  { title: "Try", text: "Pick a decant or a discovery set." },
  { title: "Love", text: "Wear it for a week and see how it settles." },
  { title: "Own", text: "Get the full bottle when you're sure." },
];

export function HowItWorks() {
  return (
    <section className="bg-card">
      <ol className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-3 md:gap-8 md:px-8 md:py-12">
        {steps.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Step {i + 1}</span>
            <h2 className="text-2xl font-medium">{step.title}</h2>
            <p className="text-sm">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
