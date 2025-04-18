"use client"

import { useState } from "react"
import { Star, Trash2, Eye, ThumbsUp } from "lucide-react"
import { GamingButton } from "@/components/ui/gaming-button"
import { AdminReviewModal } from "./admin-review-modal"
import type { Review } from "./admin-reviews-page"

interface AdminReviewsTableProps {
  reviews: Review[]
  onDeleteReview: (id: string) => void
}

export function AdminReviewsTable({ reviews, onDeleteReview }: AdminReviewsTableProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleViewReview = (review: Review) => {
    setSelectedReview(review)
    setShowModal(true)
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      {reviews.length === 0 ? (
        <div className="flex h-32 items-center justify-center p-4 text-gray-400">
          No reviews found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-gray-300">Product</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-gray-300">Rating</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-gray-300">Title</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-gray-300">Helpful</th>
                <th className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-border hover:bg-muted/10">
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-white">{review.product_name}</td>
                  <td className="px-4 py-3 text-sm text-white">{review.user_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex">
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
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-white">{review.title}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-400">{formatDate(review.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-white">
                    <div className="flex items-center">
                      <ThumbsUp className="mr-1 h-4 w-4 text-amber-400" />
                      {review.helpful_count}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <GamingButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReview(review)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </GamingButton>
                      <GamingButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteReview(review.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </GamingButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReview && (
        <AdminReviewModal
          review={selectedReview}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onDelete={() => {
            onDeleteReview(selectedReview.id)
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
