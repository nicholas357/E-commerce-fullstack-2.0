"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"
import { type Category, categoryService } from "@/lib/category-service"
import { ErrorDisplay } from "@/components/admin/error-display"

export default function EditCategoryPage() {
  const params = useParams()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [categoryData, parentCategoriesData] = await Promise.all([
        categoryService.getCategoryById(categoryId),
        categoryService.getParentCategories(),
      ])

      if (!categoryData) {
        setError("Category not found")
        return
      }

      setCategory(categoryData)
      setParentCategories(parentCategoriesData)
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
          <h1 className="text-2xl font-bold">Edit Category</h1>
          <p className="text-muted-foreground">Update category details</p>
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
    return <ErrorDisplay message="Category not found" />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground">Update category details</p>
      </div>
      <div className="rounded-md border border-border bg-card p-8">
        <CategoryForm category={category} parentCategories={parentCategories} />
      </div>
    </div>
  )
}
