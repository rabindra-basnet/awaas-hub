import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesSkeleton() {
  return (
    <div className="flex h-full min-h-0 overflow-hidden">

      {/* Filter sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-border/60 bg-card ml-2 rounded-tl-xl">
        <div className="p-5 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* Filter groups */}
          {[3, 5, 4, 2, 2].map((count, g) => (
            <div key={g} className="space-y-3">
              <Skeleton className="h-3 w-24" />
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-1">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-5" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Results pane */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">

        {/* Info bar */}
        <div className="shrink-0 px-4 lg:px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-hidden px-4 lg:px-6 pb-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
