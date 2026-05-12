import Header from "@/components/Header";

function SkeletonDayColumn() {
  return (
    <div className="overflow-hidden rounded-2xl border border-text-sub/10 bg-card">
      <div className="h-10 animate-pulse bg-background-secondary" />
      <div className="divide-y divide-text-sub/5 p-2 space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-2">
            <div className="h-14 w-10 shrink-0 animate-pulse rounded bg-background-secondary" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-background-secondary" />
              <div className="h-2.5 w-2/3 animate-pulse rounded bg-background-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScheduleLoading() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-32 animate-pulse rounded bg-background-secondary" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonDayColumn key={i} />)}
          </div>
        </div>
      </main>
    </>
  );
}
