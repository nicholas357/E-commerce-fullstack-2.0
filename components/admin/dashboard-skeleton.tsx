import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <Skeleton className="h-5 w-40 bg-gray-700" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-4 bg-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2 rounded-full bg-gray-700" />
                  <Skeleton className="h-5 w-32 bg-gray-700" />
                </div>
                <Skeleton className="h-8 w-20 bg-gray-700" />
                <Skeleton className="h-4 w-28 bg-gray-700" />
              </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <Skeleton className="h-6 w-32 mb-4 bg-gray-700" />
              <div className="space-y-4">
                {Array(4)
                  .fill(0)
                  .map((_, j) => (
                    <div key={j} className="flex justify-between items-center pb-2 border-b border-border">
                      <Skeleton className="h-4 w-40 bg-gray-700" />
                      <Skeleton className="h-4 w-20 bg-gray-700" />
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
