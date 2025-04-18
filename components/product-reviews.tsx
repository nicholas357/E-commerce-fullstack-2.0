"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ThumbsUp, Flag, User } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { useToast } from "@/components/ui/toast-provider"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/auth-context"
import { createClient } from "@/lib/supabase/client"

interface Review {
  id: string
  user_name: string
  user_avatar?: string
  rating: number
  created_at: string
  title: string
  content: string
  helpful_count: number
  is_helpful?: boolean
}

interface ProductReviewsProps {
  productId: string
  rating: number
  reviewCount: number
}

export function ProductReviews({ productId, rating, reviewCount }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userHasReviewed, setUserHasReviewed] = useState(false)
  const { addToast } = useToast()
  const { user } = useAuth()
  const supabase = createClient()

  // Fetch reviews for this product
  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("product_reviews")
          .select("*")
          .eq("product_id", productId)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        // Check if the current user has already reviewed this product
        if (user) {
          const hasReviewed = data.some((review) => review.user_id === user.id)
          setUserHasReviewed(hasReviewed)
        }

        // Fetch helpful votes for the current user
        let reviewsWithHelpful = [...data]

        if (user) {
          const { data: helpfulVotes, error: votesError } = await supabase
            .from("helpful_reviews")
            .select("review_id")
            .eq("user_id", user.id)

          if (!votesError && helpfulVotes) {
            const helpfulReviewIds = new Set(helpfulVotes.map((vote) => vote.review_id))

            reviewsWithHelpful = data.map((review) => ({
              ...review,
              is_helpful: helpfulReviewIds.has(review.id),
            }))
          }
        }

        setReviews(reviewsWithHelpful)
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

    if (productId) {
      fetchReviews()
    }
  }, [productId, user, supabase, addToast])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      addToast({
        title: "Authentication required",
        description: "Please log in to submit a review.",
        type: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Insert the review into the database
      const { data, error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: productId,
          user_id: user.id,
          user_name: user.full_name || "Anonymous",
          user_avatar: user.avatar_url,
          rating: reviewRating,
          title: reviewTitle,
          content: reviewContent,
          helpful_count: 0,
        })
        .select()

      if (error) {
        throw error
      }

      // Add the new review to the state
      if (data && data.length > 0) {
        setReviews([data[0], ...reviews])
        setUserHasReviewed(true)
      }

      // Reset form
      setReviewTitle("")
      setReviewContent("")
      setReviewRating(5)
      setShowReviewForm(false)

      addToast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
        type: "success",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      addToast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const markHelpful = async (reviewId: string) => {
    if (!user) {
      addToast({
        title: "Authentication required",
        description: "Please log in to mark reviews as helpful.",
        type: "error",
      })
      return
    }

    try {
      // Check if the user has already marked this review as helpful
      const { data: existingVotes } = await supabase
        .from("helpful_reviews")
        .select("*")
        .eq("review_id", reviewId)
        .eq("user_id", user.id)
        .single()

      if (existingVotes) {
        // User already marked this as helpful, so remove their vote
        await supabase.from("helpful_reviews").delete().eq("review_id", reviewId).eq("user_id", user.id)

        // Decrement the helpful count
        await supabase.rpc("decrement_helpful_count", {
          p_review_id: reviewId,
        })

        // Update the UI
        setReviews(
          reviews.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpful_count: review.helpful_count - 1,
                  is_helpful: false,
                }
              : review,
          ),
        )
      } else {
        // Add a new helpful vote
        await supabase.from("helpful_reviews").insert({
          review_id: reviewId,
          user_id: user.id,
        })

        // Increment the helpful count
        await supabase.rpc("increment_helpful_count", {
          p_review_id: reviewId,
        })

        // Update the UI
        setReviews(
          reviews.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  helpful_count: review.helpful_count + 1,
                  is_helpful: true,
                }
              : review,
          ),
        )
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error)
      addToast({
        title: "Error",
        description: "Failed to mark review as helpful. Please try again.",
        type: "error",
      })
    }
  }

  const reportReview = (reviewId: string) => {
    if (!user) {
      addToast({
        title: "Authentication required",
        description: "Please log in to report reviews.",
        type: "error",
      })
      return
    }

    addToast({
      title: "Review reported",
      description: "Thank you for helping us maintain quality reviews.",
      type: "info",
    })
  }

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach((review) => {
    ratingCounts[review.rating - 1]++
  })

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div>
      <div className="mb-8 grid gap-8 md:grid-cols-3">
        {/* Rating Summary */}
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-muted/30 p-6">
          <h3 className="mb-2 text-xl font-bold text-white">{rating.toFixed(1)}</h3>
          <div className="mb-2 flex">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                />
              ))}
          </div>
          <p className="text-sm text-gray-400">Based on {reviewCount} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <h3 className="mb-4 text-lg font-medium text-white">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center">
                <span className="w-8 text-sm text-gray-400">{star} ★</span>
                <div className="mx-2 h-4 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${reviews.length > 0 ? (ratingCounts[star - 1] / reviews.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="w-8 text-right text-sm text-gray-400">{ratingCounts[star - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write a Review Button */}
      <div className="mb-8 flex justify-center">
        {!user ? (
          <GamingButton
            variant="amber"
            onClick={() =>
              addToast({
                title: "Authentication required",
                description: "Please log in to submit a review.",
                type: "error",
              })
            }
          >
            Write a Review
          </GamingButton>
        ) : userHasReviewed ? (
          <div className="text-center">
            <p className="mb-2 text-amber-400">You've already reviewed this product</p>
            <GamingButton variant="secondary" disabled>
              Already Reviewed
            </GamingButton>
          </div>
        ) : (
          <GamingButton variant="amber" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? "Cancel Review" : "Write a Review"}
          </GamingButton>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && !userHasReviewed && user && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 overflow-hidden rounded-md border border-border bg-card p-6"
        >
          <h3 className="mb-4 text-lg font-medium text-white">Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Rating</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1">
                    <Star
                      className={`h-6 w-6 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-title" className="mb-2 block text-sm font-medium text-white">
                Title
              </label>
              <input
                id="review-title"
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-background p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Summarize your experience"
              />
            </div>

            <div>
              <label htmlFor="review-content" className="mb-2 block text-sm font-medium text-white">
                Review
              </label>
              <textarea
                id="review-content"
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                required
                rows={4}
                className="w-full rounded-md border border-border bg-background p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Share your experience with this product"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <GamingButton type="submit" variant="amber" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </GamingButton>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Customer Reviews</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-6 text-center">
            <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-md border border-border bg-card p-6"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-black">
                    {review.user_avatar ? (
                      <img
                        src={review.user_avatar || "/placeholder.svg"}
                        alt={review.user_name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="ml-2 font-medium text-white">{review.user_name}</span>
                </div>
                <span className="text-sm text-gray-400">{formatDate(review.created_at)}</span>
              </div>

              <div className="mb-2 flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                    />
                  ))}
              </div>

              <h4 className="mb-2 font-medium text-white">{review.title}</h4>
              <p className="mb-4 text-sm text-gray-400">{review.content}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => markHelpful(review.id)}
                  disabled={!user}
                  className={`flex items-center text-sm ${
                    review.is_helpful ? "text-amber-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  Helpful ({review.helpful_count})
                </button>
                <button
                  onClick={() => reportReview(review.id)}
                  disabled={!user}
                  className="flex items-center text-sm text-gray-400 hover:text-white"
                >
                  <Flag className="mr-1 h-4 w-4" />
                  Report
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
