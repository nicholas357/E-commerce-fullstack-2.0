import { Skeleton } from "@/components/ui/skeleton"

export default function UserDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-64 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-48 md:col-span-2" />
        <Skeleton className="h-48" />
      </div>

      <Skeleton className="h-64 w-full" />
    </div>
  )
}
