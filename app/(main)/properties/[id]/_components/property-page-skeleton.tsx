// app/(main)/properties/[id]/_components/property-page-skeleton.tsx
export default function PropertyPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <div className="sticky top-0 z-50 h-14 border-b bg-background/80 backdrop-blur-xl" />

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
          {/* Info panel skeleton — order-1 on mobile */}
          <div className="flex flex-col gap-4 order-1 lg:order-2">
            <div className="h-8 w-3/4 rounded-xl bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded-lg bg-muted animate-pulse" />
            <div className="h-20 rounded-2xl bg-muted animate-pulse" />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
            <div className="h-12 rounded-xl bg-muted animate-pulse" />
            <div className="h-12 rounded-xl bg-muted animate-pulse" />
          </div>

          {/* Gallery skeleton — order-2 on mobile */}
          <div className="flex flex-col gap-3 order-2 lg:order-1">
            <div className="w-full aspect-[6/4] rounded-2xl bg-muted animate-pulse" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-[72px] h-[54px] shrink-0 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
