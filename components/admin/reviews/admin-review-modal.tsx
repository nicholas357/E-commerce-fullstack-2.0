"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { GamingButton } from "@/components/ui/gaming-button"
import { Star, User, ThumbsUp, Calendar, Tag } from "lucide-react"
import type { Review } from "./admin-reviews-page"

interface AdminReviewModalProps {
  review: Review
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
}

export function AdminReviewModal({ review, isOpen, onClose, onDelete }: AdminReviewModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-border bg-card text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Review Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Review Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">{review.title}</h3>
              <div className="mt-1 flex items-center">
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                      />
                    ))}
                </div>
                <span className="ml-2 text-sm text-gray-400">({review.rating}/5)</span>
              </div>
            </div>
            <div className="flex items-center rounded-md bg-amber-500/10 px-3 py-1 text-amber-400">
              <ThumbsUp className="mr-2 h-4 w-4" />
              {review.helpful_count} {review.helpful_count === 1 ? "person" : "people"} found this helpful
            </div>
          </div>

          {/* Review Content */}
          <div className="rounded-md border border-border bg-background p-4">
            <p className="whitespace-pre-line text-gray-300">{review.content}</p>
          </div>

          {/* Review Metadata */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-md border border-border bg-background p-4">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">Reviewer</div>
                  <div className="text-sm text-gray-400">{review.user_name}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">Submitted On</div>
                  <div className="text-sm text-gray-400">{formatDate(review.created_at)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-border bg-background p-4">
              <div className="flex items-center">
                <Tag className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">Product</div>
                  <div className="text-sm text-gray-400">{review.product_name}</div>
                </div>
              </div>
              <div className="flex items-center">
                <ThumbsUp className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">Helpful Count</div>
                  <div className="text-sm text-gray-400">{review.helpful_count}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-between">
          <GamingButton variant="outline" onClick={onClose}>
            Close
          </GamingButton>
          <GamingButton variant="destructive" onClick={onDelete}>
            Delete Review
          </GamingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
