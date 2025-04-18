"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { ProductSkeleton } from "@/components/product-skeleton"
import { categoryService } from "@/lib/category-service"
import { productService } from "@/lib/product-service"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function CategoryPage() {
  const params = useParams()
  const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug]

  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [category, setCategory] = useState<any>(null)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; url: string }[]>([{ name: "Home", url: "/" }])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Reset states
        setCategory(null)
        setSubcategory(null)
        setBreadcrumbs([{ name: "Home", url: "/" }])

        // Get all categories to find by slug
        const allCategories = await categoryService.getCategories()

        if (slugArray.length === 1) {
          // Single slug - this is a parent category
          const parentSlug = slugArray[0]
          const foundCategory = allCategories.find((c) => c.slug === parentSlug && !c.parent_id)

          if (!foundCategory) {
            setError("Category not found")
            setLoading(false)
            return
          }

          setCategory(foundCategory)
          setBreadcrumbs((prev) => [...prev, { name: foundCategory.name, url: `/category/${foundCategory.slug}` }])

          // Get products for this category
          const categoryProducts = await productService.getProductsByCategory(foundCategory.id)
          setProducts(categoryProducts)
        } else if (slugArray.length === 2) {
          // Two slugs - this is a parent/subcategory combination
          const [parentSlug, subSlug] = slugArray

          // Find parent category
          const parentCategory = allCategories.find((c) => c.slug === parentSlug && !c.parent_id)
          if (!parentCategory) {
            setError("Parent category not found")
            setLoading(false)
            return
          }

          // Find subcategory
          const subCategory = allCategories.find((c) => c.slug === subSlug && c.parent_id === parentCategory.id)
          if (!subCategory) {
            setError("Subcategory not found")
            setLoading(false)
            return
          }

          setCategory(parentCategory)
          setSubcategory(subCategory)

          // Update breadcrumbs
          setBreadcrumbs((prev) => [
            ...prev,
            { name: parentCategory.name, url: `/category/${parentCategory.slug}` },
            { name: subCategory.name, url: `/category/${parentCategory.slug}/${subCategory.slug}` },
          ])

          // Get products for this subcategory
          const subCategoryProducts = await productService.getProductsByCategory(subCategory.id)
          setProducts(subCategoryProducts)
        } else {
          setError("Invalid category path")
        }
      } catch (err) {
        console.error("Error fetching category data:", err)
        setError("Failed to load category data")
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [slugArray])

  // If we're still loading, show skeletons
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 h-8 w-64 animate-pulse rounded-md bg-muted/30"></div>

        <div className="mb-12 h-4 w-full max-w-2xl animate-pulse rounded-md bg-muted/20"></div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
        </div>
      </div>
    )
  }

  // If there was an error, show error message
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">{error}</h1>
          <p className="mb-6 text-gray-400">The category you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-600"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex flex-wrap items-center text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-amber-400">{crumb.name}</span>
              ) : (
                <Link href={crumb.url} className="text-gray-400 hover:text-white">
                  {crumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-3xl font-bold text-white">{subcategory ? subcategory.name : category?.name}</h1>
        <p className="max-w-3xl text-gray-400">
          {subcategory
            ? subcategory.description
            : category?.description ||
              `Explore our collection of ${subcategory ? subcategory.name : category?.name} products. 
            Find the best deals and latest releases.`}
        </p>
      </div>

      {/* Category Banner (if available) */}
      {(subcategory?.image || category?.image) && (
        <div className="relative mb-12 h-48 w-full overflow-hidden rounded-lg md:h-64">
          <Image
            src={subcategory?.image || category?.image || "/placeholder.svg"}
            alt={subcategory ? subcategory.name : category?.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
            <div className="flex h-full flex-col justify-center p-8">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                {subcategory ? subcategory.name : category?.name}
              </h2>
            </div>
          </div>
        </div>
      )}

      {/* Subcategories (if on parent category page) */}
      {category && !subcategory && (
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Browse Subcategories</h2>
          <SubcategoriesGrid parentId={category.id} />
        </div>
      )}

      {/* Products Grid */}
      <div className="mb-8">
        <h2 className="mb-6 text-xl font-bold text-white">{products.length > 0 ? "Products" : "No Products Found"}</h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  rating: product.rating || 4.5,
                  reviewCount: product.reviewCount || 10,
                  inStock: product.stock > 0,
                }}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 text-center">
            <p className="mb-6 text-gray-400">No products found in this category.</p>
            <Link
              href="/"
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-600"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Subcategories Grid Component
function SubcategoriesGrid({ parentId }: { parentId: string }) {
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const subs = await categoryService.getSubcategories(parentId)
        setSubcategories(subs.filter((sub) => sub.is_active))
      } catch (error) {
        console.error("Error fetching subcategories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubcategories()
  }, [parentId])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted/30"></div>
          ))}
      </div>
    )
  }

  if (subcategories.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {subcategories.map((subcat) => {
        // Find parent category to build the URL
        const parentCategory = subcat.parent_id ? { slug: "" } : null

        return (
          <Link
            key={subcat.id}
            href={`/category/${parentCategory?.slug || ""}/${subcat.slug}`}
            className="group relative overflow-hidden rounded-lg border border-border transition-all hover:border-amber-500"
          >
            <div className="relative h-32">
              {subcat.image ? (
                <Image
                  src={subcat.image || "/placeholder.svg"}
                  alt={subcat.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-amber-900/30 to-black"></div>
              )}
              <div className="absolute inset-0 bg-black/50 transition-opacity group-hover:bg-black/30"></div>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <h3 className="text-center text-lg font-bold text-white">{subcat.name}</h3>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
