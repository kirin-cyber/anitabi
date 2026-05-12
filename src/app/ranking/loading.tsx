import Header from "@/components/Header";

function SkeletonRankRow() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-text-sub/10 bg-card px-4 py-3">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-background-secondary" />
      <div className="h-16 w-12 shrink-0 animate-pulse rounded bg-background-secondary" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-background-secondary" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-background-secondary" />
      </div>
    </div>
  );
}

export default function RankingLoading() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-36 animate-pulse rounded bg-background-secondary" />
          </div>
          <div className="mb-6 h-12 animate-pulse rounded-xl bg-background-secondary" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonRankRow key={i} />)}
          </div>
        </div>
      </main>
    </>
  );
}
