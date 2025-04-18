"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { ProductSkeleton } from "@/components/product-skeleton"
import { GamingButton } from "@/components/ui/gaming-button"
import { productService } from "@/lib/product-service"
import { categoryService } from "@/lib/category-service"

export function RelatedProducts({ currentProductId, category }: { currentProductId: string; category: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState<string>("Related Products")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check if category is a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)

        let categoryNameValue = category

        // If it's a UUID, get the category name
        if (isUUID) {
          const name = await categoryService.getCategoryName(category)
          categoryNameValue = name
          setCategoryName(name)
        } else {
          setCategoryName(category)
        }

        // Get related products directly from the service
        const relatedProducts = await productService.getRelatedProducts(currentProductId, category, 4)

        if (relatedProducts.length === 0) {
          setError("No related products found")
        }

        setProducts(relatedProducts)
      } catch (error) {
        console.error("Error fetching related products:", error)
        setError("Failed to load related products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [currentProductId, category])

  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Related Products</h2>
          <GamingButton variant="outline" size="sm">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </GamingButton>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
        </div>
      </div>
    )
  }

  if (error || products.length === 0) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Related Products</h2>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-gray-400">No related products found.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">More {categoryName} Products</h2>
        <GamingButton variant="outline" size="sm" href={`/category/${category}`}>
          View All <ChevronRight className="ml-1 h-4 w-4" />
        </GamingButton>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  )
}
