"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Star } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { createClient } from "@/lib/supabase/client"
import type { Review } from "./admin-reviews-page"

interface Product {
  id: string
  name: string
}

interface AdminReviewsFilterProps {
  filter: {
    rating: number
    product: string
    dateRange: string
    searchTerm: string
  }
  setFilter: (filter: any) => void
  reviews: Review[]
}

export function AdminReviewsFilter({ filter, setFilter, reviews }: AdminReviewsFilterProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch products for the filter
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("products").select("id, name").order("name")

        if (error) {
          throw error
        }

        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleRatingFilter = (rating: number) => {
    setFilter({ ...filter, rating: filter.rating === rating ? 0 : rating })
  }

  const handleResetFilters = () => {
    setFilter({
      rating: 0,
      product: "",
      dateRange: "all",
      searchTerm: "",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search reviews by title, content, user or product..."
            value={filter.searchTerm}
            onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Filter Toggle */}
        <GamingButton variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters {Object.values(filter).some((v) => v !== 0 && v !== "" && v !== "all") && "(Active)"}
        </GamingButton>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Rating Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-white">Rating</h3>
              <div className="flex flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`flex items-center rounded-md border px-3 py-1 text-sm ${
                      filter.rating === rating
                        ? "border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border-border bg-background text-gray-400 hover:border-amber-500/50"
                    }`}
                  >
                    {rating}
                    <Star
                      className={`ml-1 h-3 w-3 ${
                        filter.rating === rating ? "fill-amber-400 text-amber-400" : "text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-white">Product</h3>
              <select
                value={filter.product}
                onChange={(e) => setFilter({ ...filter, product: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-white">Date Range</h3>
              <select
                value={filter.dateRange}
                onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <div className="text-sm text-gray-400">
              Showing {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </div>
            <GamingButton variant="outline" size="sm" onClick={handleResetFilters}>
              Reset Filters
            </GamingButton>
          </div>
        </div>
      )}
    </div>
  )
}
