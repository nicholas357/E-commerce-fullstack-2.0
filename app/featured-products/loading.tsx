import { ProductSkeleton } from "@/components/product-skeleton"

export default function FeaturedProductsLoading() {
  return (
    <div className="bg-background min-h-screen">
      <div className="relative overflow-hidden bg-background py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.05),transparent_70%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="mb-10">
            <div className="h-4 w-24 bg-gray-700 rounded mb-4"></div>
            <div className="h-10 w-64 bg-gray-700 rounded mb-6"></div>
            <div className="h-4 w-full max-w-3xl bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-full max-w-2xl bg-gray-700 rounded mb-8"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(12)
              .fill(0)
              .map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
