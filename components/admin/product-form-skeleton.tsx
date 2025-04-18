import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function ProductFormSkeleton() {
  return (
    <div>
      <Card className="p-6 border-border bg-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-2">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>

          <div>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>

          <div>
            <Skeleton className="h-5 w-28 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div className="col-span-2">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="col-span-2 flex flex-wrap gap-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </Card>

      <div className="mt-6 flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
