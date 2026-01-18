export default function Loading() { 
    return (
        <div className="min-h-screen w-full bg-background px-6 py-6 space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-9 w-48 bg-muted rounded animate-pulse"></div>
                    <div className="h-5 w-64 bg-muted rounded animate-pulse"></div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-64 bg-muted rounded-lg animate-pulse"></div>
                    <div className="h-10 w-10 bg-muted rounded-lg animate-pulse"></div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                            <div className="h-10 w-10 bg-muted rounded-lg animate-pulse"></div>
                        </div>
                        <div className="h-8 w-32 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                    </div>
                ))}
            </div>

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Properties Card Skeleton */}
                <div className="lg:col-span-2 rounded-lg border bg-card p-6 space-y-4">
                    <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                                <div className="h-16 w-16 bg-muted rounded-lg animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 w-3/4 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
                                </div>
                                <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's Schedule Card Skeleton */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <div className="h-6 w-36 bg-muted rounded animate-pulse"></div>
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2 p-3 rounded-lg border">
                                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                                <div className="h-3 w-2/3 bg-muted rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}