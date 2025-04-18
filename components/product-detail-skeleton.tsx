import { Skeleton } from "@/components/ui/skeleton"

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Product Images Skeleton */}
      <div className="space-y-4">
        {/* Main Image Skeleton */}
        <Skeleton className="aspect-square w-full rounded-lg bg-muted" />

        {/* Thumbnail Gallery Skeleton */}
        <div className="flex gap-2">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="aspect-square h-20 w-20 rounded-md bg-muted" />
            ))}
        </div>
      </div>

      {/* Product Info Skeleton */}
      <div className="flex flex-col">
        {/* Breadcrumbs Skeleton */}
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-16 bg-muted" />
          <Skeleton className="h-4 w-4 rounded-full bg-muted" />
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-4 w-4 rounded-full bg-muted" />
          <Skeleton className="h-4 w-32 bg-muted" />
        </div>

        {/* Category Skeleton */}
        <Skeleton className="mb-2 h-4 w-24 bg-muted" />

        {/* Title Skeleton */}
        <Skeleton className="mb-4 h-8 w-3/4 bg-muted" />

        {/* Rating Skeleton */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="mr-1 h-5 w-5 rounded-full bg-muted" />
              ))}
          </div>
          <Skeleton className="h-4 w-16 bg-muted" />
        </div>

        {/* Price Skeleton */}
        <Skeleton className="mb-6 h-8 w-32 bg-muted" />

        {/* Options Skeleton (for membership duration or game edition) */}
        <div className="mb-6">
          <Skeleton className="mb-3 h-5 w-48 bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-md bg-muted" />
              ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="mb-6 flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-md bg-muted" />
          <Skeleton className="h-11 w-11 rounded-md bg-muted" />
          <Skeleton className="h-11 w-11 rounded-md bg-muted" />
        </div>

        {/* Stock Status Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full bg-muted" />
          <Skeleton className="h-4 w-24 bg-muted" />
        </div>

        {/* Features Skeleton */}
        <Skeleton className="mb-6 h-40 w-full rounded-md bg-muted" />

        {/* Login Prompt Skeleton */}
        <Skeleton className="h-32 w-full rounded-md bg-muted" />
      </div>
    </div>
  )
}
