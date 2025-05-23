export default function CategoriesLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
        <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted"></div>
      </div>
      <div className="rounded-md border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted"></div>
          <div className="h-9 w-32 animate-pulse rounded-md bg-muted"></div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-10 w-10 animate-pulse rounded-md bg-muted"></div>
                <div className="h-6 w-32 animate-pulse rounded-md bg-muted"></div>
                <div className="h-6 w-24 animate-pulse rounded-md bg-muted"></div>
                <div className="h-6 w-16 animate-pulse rounded-md bg-muted"></div>
                <div className="h-6 w-20 animate-pulse rounded-md bg-muted"></div>
                <div className="ml-auto h-8 w-8 animate-pulse rounded-md bg-muted"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
