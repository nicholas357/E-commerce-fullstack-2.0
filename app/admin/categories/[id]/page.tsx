"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { type Category, categoryService } from "@/lib/category-service"
import type { Product } from "@/lib/product-service"
import { ProductsTable } from "@/components/admin/products-table"
import { GamingButton } from "@/components/ui/gaming-button"
import { ErrorDisplay } from "@/components/admin/error-display"

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categoryId = params.id as string

  const fetchData = async () => {
    setLoading(true)
    try {
      const [categoryData, productsData] = await Promise.all([
        categoryService.getCategoryById(categoryId),
        categoryService.getProductsByCategory(categoryId),
      ])

      if (!categoryData) {
        setError("Category not found")
        return
      }

      setCategory(categoryData)
      setProducts(productsData)
      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load category data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (categoryId) {
      fetchData()
    }
  }, [categoryId])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/admin/categories" className="mb-4 flex items-center text-muted-foreground hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-2xl font-bold">Category Products</h1>
        </div>
        <div className="rounded-md border border-border bg-card p-8">
          <div className="space-y-4">
            <div className="h-8 w-1/3 animate-pulse rounded-md bg-muted"></div>
            <div className="h-64 animate-pulse rounded-md bg-muted"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />
  }

  if (!category) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Link href="/admin/categories" className="mb-4 flex items-center text-muted-foreground hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
          <h1 className="text-2xl font-bold">Category Not Found</h1>
        </div>
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="mb-4">The category you are looking for does not exist or has been deleted.</p>
          <Link href="/admin/categories" className="text-amber-400 hover:underline">
            Return to Categories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin/categories" className="mb-4 flex items-center text-muted-foreground hover:text-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{category.name} Products</h1>
            <p className="text-muted-foreground">
              {products.length} product{products.length !== 1 ? "s" : ""} in this category
            </p>
          </div>
          <div className="flex gap-4">
            <Link href={`/admin/categories/edit/${category.id}`}>
              <GamingButton variant="outline">Edit Category</GamingButton>
            </Link>
            <Link href="/admin/products/new">
              <GamingButton variant="amber" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </GamingButton>
            </Link>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="mb-4">No products found in this category.</p>
          <Link href="/admin/products/new" className="text-amber-400 hover:underline">
            Add your first product
          </Link>
        </div>
      ) : (
        <ProductsTable products={products} onProductDeleted={fetchData} />
      )}
    </div>
  )
}
