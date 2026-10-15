export function PagePlaceholder({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-3 text-muted-foreground">Not built yet.</p>
    </main>
  );
}
