import { Skeleton } from "@/components/ui/skeleton"

export function OrderSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-lg">
      {/* Order header skeleton */}
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-muted" />
            <Skeleton className="h-5 w-24 bg-muted" />
            <Skeleton className="ml-2 h-5 w-16 rounded-full bg-muted" />
          </div>
          <Skeleton className="mt-1 h-4 w-32 bg-muted" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24 bg-muted" />
          <Skeleton className="h-8 w-28 rounded-md bg-muted" />
        </div>
      </div>

      {/* Order details preview skeleton */}
      <div className="p-4">
        <div className="flex items-center gap-4 py-4">
          <Skeleton className="h-16 w-16 rounded-md bg-muted" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-3/4 bg-muted" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 bg-muted" />
              <Skeleton className="h-3 w-16 bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
