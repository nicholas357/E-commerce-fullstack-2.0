"use client"

import { useState, useEffect } from "react"
import { CategoryForm } from "@/components/admin/category-form"
import { type Category, categoryService } from "@/lib/category-service"
import { ErrorDisplay } from "@/components/admin/error-display"

export default function NewCategoryPage() {
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchParentCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryService.getParentCategories()
      setParentCategories(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching parent categories:", err)
      setError("Failed to load parent categories. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParentCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">New Subcategory</h1>
          <p className="text-muted-foreground">Create a new subcategory</p>
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
    return <ErrorDisplay message={error} onRetry={fetchParentCategories} />
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Subcategory</h1>
        <p className="text-muted-foreground">Create a new subcategory under one of the fixed parent categories</p>
      </div>
      <div className="rounded-md border border-border bg-card p-8">
        <CategoryForm parentCategories={parentCategories} />
      </div>
    </div>
  )
}
