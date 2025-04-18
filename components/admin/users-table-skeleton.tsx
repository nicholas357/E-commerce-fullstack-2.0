import { Skeleton } from "@/components/ui/skeleton"

export function UsersTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <Skeleton className="h-10 w-32 rounded-md bg-gray-700" />
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-4 mb-6">
        <Skeleton className="h-6 w-32 bg-gray-700" />
        <Skeleton className="h-10 w-full bg-gray-700 rounded-md" />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </th>
                <th className="px-4 py-3 text-right">
                  <Skeleton className="h-4 w-16 ml-auto bg-gray-700" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-24 bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-32 bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-16 rounded-full bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-20 bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {Array(3)
                          .fill(0)
                          .map((_, j) => (
                            <Skeleton key={j} className="h-6 w-6 rounded-md bg-gray-700" />
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40 bg-gray-700" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md bg-gray-700" />
          <Skeleton className="h-8 w-20 rounded-md bg-gray-700" />
        </div>
      </div>
    </div>
  )
}
