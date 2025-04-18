import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border-2 border-muted bg-card shadow-lg">
      <div className="relative">
        <Skeleton className="aspect-[4/3] w-full bg-muted" />
      </div>
      <div className="p-4">
        <Skeleton className="mb-2 h-4 w-1/3 bg-muted" />
        <Skeleton className="mb-2 h-6 w-full bg-muted" />
        <Skeleton className="mb-2 h-6 w-full bg-muted" />
        <Skeleton className="mb-4 h-4 w-24 bg-muted" />
        <div className="flex items-end justify-between">
          <Skeleton className="h-6 w-20 bg-muted" />
          <Skeleton className="h-10 w-28 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  )
}
