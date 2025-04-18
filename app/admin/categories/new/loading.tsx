export default function NewCategoryLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="mb-4 flex items-center">
          <div className="h-4 w-4 animate-pulse rounded-md bg-muted"></div>
          <div className="ml-2 h-4 w-32 animate-pulse rounded-md bg-muted"></div>
        </div>
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted"></div>
      </div>
      <div className="rounded-md border border-border bg-card p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
              <div className="h-32 w-full animate-pulse rounded-md bg-muted"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded-md bg-muted"></div>
              <div className="h-40 w-full animate-pulse rounded-md bg-muted"></div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <div className="h-10 w-24 animate-pulse rounded-md bg-muted"></div>
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>
    </div>
  )
}
