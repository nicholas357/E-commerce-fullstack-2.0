"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface CustomFileUploadProps {
  initialImage?: string | null
  onFileChange: (file: File | null) => void
  accept?: string
  preview?: string | null
  previewAlt?: string
}

export function CustomFileUpload({
  initialImage,
  onFileChange,
  accept = "image/*",
  preview = null,
  previewAlt = "Preview",
}: CustomFileUploadProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(preview || initialImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    onFileChange(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImagePreview(null)
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {imagePreview ? (
        <div className="relative inline-block">
          <Image
            src={imagePreview || "/placeholder.svg"}
            alt={previewAlt}
            width={200}
            height={200}
            className="rounded-md object-cover"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleButtonClick}
          className="flex h-[200px] w-[200px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/50"
        >
          <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Click to upload image</span>
        </button>
      )}
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
    </div>
  )
}
