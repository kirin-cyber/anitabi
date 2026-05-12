import Header from "@/components/Header";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-text-sub/10 bg-card">
      <div className="h-48 animate-pulse bg-background-secondary" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 animate-pulse rounded bg-background-secondary" />
        <div className="h-4 w-full animate-pulse rounded bg-background-secondary" />
        <div className="h-3 w-24 animate-pulse rounded bg-background-secondary" />
      </div>
    </div>
  );
}

export default function AnimeLoading() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-32 animate-pulse rounded bg-background-secondary" />
            <div className="h-4 w-56 animate-pulse rounded bg-background-secondary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </main>
    </>
  );
}
