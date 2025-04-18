"use client"

import { useState, useEffect } from "react"
import { Star, Edit, Trash2, ThumbsUp, AlertCircle } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/toast-provider"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/context/auth-context"
import { EditReviewModal } from "./edit-review-modal"

interface UserReview {
  id: string
  product_id: string
  product_name: string
  product_image: string
  rating: number
  title: string
  content: string
  helpful_count: number
  created_at: string
}

export function UserReviews() {
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<UserReview | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserReviews() {
      if (!user) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("product_reviews")
          .select(`
            *,
            products:product_id (
              name,
              image
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Transform the data to include product information
        const reviewsWithProductInfo = data.map((review) => ({
          ...review,
          product_name: review.products?.name || "Unknown Product",
          product_image: review.products?.image || "/placeholder.svg",
        }))

        setReviews(reviewsWithProductInfo)
      } catch (error) {
        console.error("Error fetching user reviews:", error)
        addToast({
          title: "Error",
          description: "Failed to load your reviews. Please try again.",
          type: "error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserReviews()
  }, [user, supabase, addToast])

  const handleEditReview = (review: UserReview) => {
    setSelectedReview(review)
    setIsEditModalOpen(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      try {
        const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId)

        if (error) {
          throw error
        }

        // Update the reviews list
        setReviews(reviews.filter((review) => review.id !== reviewId))

        addToast({
          title: "Review Deleted",
          description: "Your review has been successfully deleted.",
          type: "success",
        })
      } catch (error) {
        console.error("Error deleting review:", error)
        addToast({
          title: "Error",
          description: "Failed to delete your review. Please try again.",
          type: "error",
        })
      }
    }
  }

  const handleUpdateReview = async (updatedReview: {
    id: string
    rating: number
    title: string
    content: string
  }) => {
    try {
      const { error } = await supabase
        .from("product_reviews")
        .update({
          rating: updatedReview.rating,
          title: updatedReview.title,
          content: updatedReview.content,
        })
        .eq("id", updatedReview.id)

      if (error) {
        throw error
      }

      // Update the reviews list
      setReviews(
        reviews.map((review) =>
          review.id === updatedReview.id
            ? {
                ...review,
                rating: updatedReview.rating,
                title: updatedReview.title,
                content: updatedReview.content,
              }
            : review,
        ),
      )

      setIsEditModalOpen(false)
      setSelectedReview(null)

      addToast({
        title: "Review Updated",
        description: "Your review has been successfully updated.",
        type: "success",
      })
    } catch (error) {
      console.error("Error updating review:", error)
      addToast({
        title: "Error",
        description: "Failed to update your review. Please try again.",
        type: "error",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Reviews</h2>
        <span className="text-sm text-gray-400">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-amber-500" />
          <h3 className="mb-2 text-xl font-medium text-white">No Reviews Yet</h3>
          <p className="mb-6 text-gray-400">You haven't reviewed any products yet.</p>
          <GamingButton variant="amber" href="/products">
            Browse Products
          </GamingButton>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
                    <img
                      src={review.product_image || "/placeholder.svg"}
                      alt={review.product_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Product and Review Info */}
                  <div>
                    <h3 className="font-medium text-white">{review.product_name}</h3>
                    <div className="mt-1 flex">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"
                            }`}
                          />
                        ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-400">Reviewed on {formatDate(review.created_at)}</p>
                  </div>
                </div>

                {/* Helpful Count */}
                <div className="flex items-center text-sm text-gray-400">
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  <span>
                    {review.helpful_count} {review.helpful_count === 1 ? "person" : "people"} found this helpful
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="mt-4">
                <h4 className="font-medium text-white">{review.title}</h4>
                <p className="mt-2 text-sm text-gray-300">{review.content}</p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-end gap-2">
                <GamingButton variant="outline" size="sm" onClick={() => handleEditReview(review)}>
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </GamingButton>
                <GamingButton variant="destructive" size="sm" onClick={() => handleDeleteReview(review.id)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </GamingButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {selectedReview && (
        <EditReviewModal
          review={selectedReview}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateReview}
        />
      )}
    </div>
  )
}
