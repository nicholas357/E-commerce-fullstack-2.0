"use client"

import type React from "react"

import { useState } from "react"
import { Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { GamingButton } from "@/components/ui/gaming-button"
import { Spinner } from "@/components/ui/spinner"

interface EditReviewModalProps {
  review: {
    id: string
    product_name: string
    rating: number
    title: string
    content: string
  }
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedReview: { id: string; rating: number; title: string; content: string }) => void
}

export function EditReviewModal({ review, isOpen, onClose, onUpdate }: EditReviewModalProps) {
  const [rating, setRating] = useState(review.rating)
  const [title, setTitle] = useState(review.title)
  const [content, setContent] = useState(review.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate a slight delay for better UX
    setTimeout(() => {
      onUpdate({
        id: review.id,
        rating,
        title,
        content,
      })
      setIsSubmitting(false)
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-card text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Edit Your Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-300">Product: {review.product_name}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                  <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full rounded-md border border-border bg-background p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Share your experience with this product"
            ></textarea>
          </div>

          <DialogFooter className="mt-6">
            <GamingButton type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </GamingButton>
            <GamingButton type="submit" variant="amber" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </span>
              ) : (
                "Update Review"
              )}
            </GamingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
