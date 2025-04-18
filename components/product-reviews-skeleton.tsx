import { Skeleton } from "@/components/ui/skeleton"

export function ProductReviewsSkeleton() {
  return (
    <div>
      <div className="mb-8 grid gap-8 md:grid-cols-3">
        {/* Rating Summary Skeleton */}
        <Skeleton className="h-40 rounded-md bg-muted" />

        {/* Rating Distribution Skeleton */}
        <div className="md:col-span-2">
          <Skeleton className="mb-4 h-6 w-48 bg-muted" />
          <div className="space-y-2">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-8 bg-muted" />
                  <Skeleton className="h-4 flex-1 rounded-full bg-muted" />
                  <Skeleton className="h-4 w-8 bg-muted" />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Write a Review Button Skeleton */}
      <div className="mb-8 flex justify-center">
        <Skeleton className="h-11 w-40 rounded-md bg-muted" />
      </div>

      {/* Reviews List Skeleton */}
      <div className="space-y-6">
        <Skeleton className="mb-4 h-6 w-48 bg-muted" />

        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-md bg-muted" />
          ))}
      </div>
    </div>
  )
}
