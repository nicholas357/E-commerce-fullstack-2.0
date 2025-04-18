"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast-provider"
import { Spinner } from "@/components/ui/spinner"
import { AdminReviewsTable } from "./admin-reviews-table"
import { AdminReviewsFilter } from "./admin-reviews-filter"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export interface Review {
  id: string
  product_id: string
  product_name?: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating: number
  title: string
  content: string
  helpful_count: number
  created_at: string
}

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({
    rating: 0,
    product: "",
    dateRange: "all",
    searchTerm: "",
  })
  const { addToast } = useToast()
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  // Check if user is admin
  useEffect(() => {
    if (user && !isAdmin) {
      router.push("/admin/login")
      addToast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        type: "error",
      })
    }
  }, [user, isAdmin, router, addToast])

  // Fetch all reviews
  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true)
      try {
        const supabase = createClient()

        // Fetch reviews with product information
        const { data, error } = await supabase
          .from("product_reviews")
          .select(`
            *,
            products:product_id (
              name
            )
          `)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Transform the data to include product_name
        const reviewsWithProductNames = data.map((review) => ({
          ...review,
          product_name: review.products?.name || "Unknown Product",
        }))

        setReviews(reviewsWithProductNames)
        setFilteredReviews(reviewsWithProductNames)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        addToast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          type: "error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user && isAdmin) {
      fetchReviews()
    }
  }, [user, isAdmin, addToast])

  // Apply filters
  useEffect(() => {
    let result = [...reviews]

    // Filter by rating
    if (filter.rating > 0) {
      result = result.filter((review) => review.rating === filter.rating)
    }

    // Filter by product
    if (filter.product) {
      result = result.filter((review) => review.product_id === filter.product)
    }

    // Filter by date range
    if (filter.dateRange !== "all") {
      const now = new Date()
      const startDate = new Date()

      switch (filter.dateRange) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          break
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "year":
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      result = result.filter((review) => new Date(review.created_at) >= startDate)
    }

    // Filter by search term
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase()
      result = result.filter(
        (review) =>
          review.title.toLowerCase().includes(searchLower) ||
          review.content.toLowerCase().includes(searchLower) ||
          review.user_name.toLowerCase().includes(searchLower) ||
          review.product_name?.toLowerCase().includes(searchLower),
      )
    }

    setFilteredReviews(result)
  }, [filter, reviews])

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId)

      if (error) {
        throw error
      }

      // Update the reviews list
      setReviews(reviews.filter((review) => review.id !== reviewId))
      setFilteredReviews(filteredReviews.filter((review) => review.id !== reviewId))

      addToast({
        title: "Review Deleted",
        description: "The review has been successfully deleted.",
        type: "success",
      })
    } catch (error) {
      console.error("Error deleting review:", error)
      addToast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        type: "error",
      })
    }
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Product Reviews" description="Manage and moderate customer reviews" icon="star" />

      <AdminReviewsFilter filter={filter} setFilter={setFilter} reviews={reviews} />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <AdminReviewsTable reviews={filteredReviews} onDeleteReview={handleDeleteReview} />
      )}
    </div>
  )
}
