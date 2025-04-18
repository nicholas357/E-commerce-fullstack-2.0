"use client"

import type React from "react"
import { Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/toast-provider"

interface ProductImageUploadProps {
  imagePreview: string | null
  onImageChange: (file: File | null) => void
  onImageRemove: () => void
}

export function ProductImageUpload({ imagePreview, onImageChange, onImageRemove }: ProductImageUploadProps) {
  const { addToast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      addToast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, WebP, or GIF)",
        type: "error",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      addToast({
        title: "File too large",
        description: "Image must be less than 5MB",
        type: "error",
      })
      return
    }

    onImageChange(file)
  }

  return (
    <div className="flex items-center gap-4">
      {imagePreview && (
        <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
          <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute right-0 top-0 rounded-bl-md bg-black/70 p-1 text-white hover:bg-red-500/70"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-muted/30 px-4 py-2 text-sm text-white hover:bg-muted">
        <Upload className="h-4 w-4" />
        <span>{imagePreview ? "Change Image" : "Upload Image"}</span>
        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
      </label>
    </div>
  )
}
