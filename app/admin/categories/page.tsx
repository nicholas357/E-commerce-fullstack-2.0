"use client"

import { useState, useEffect } from "react"
import { type Category, categoryService } from "@/lib/category-service"
import { CategoriesTable } from "@/components/admin/categories-table"
import { ErrorDisplay } from "@/components/admin/error-display"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load categories. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories</p>
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
    return <ErrorDisplay message={error} onRetry={fetchCategories} />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage your product categories</p>
      </div>
      <CategoriesTable categories={categories} onCategoryDeleted={fetchCategories} />
    </div>
  )
}
