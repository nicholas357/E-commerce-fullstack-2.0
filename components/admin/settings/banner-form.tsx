"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { type Banner, type BannerFormData, bannerService } from "@/lib/banner-service"
import { Button } from "@/components/ui/button"
import { GamingButton } from "@/components/ui/gaming-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/ui/spinner"
import { ImagePlus, Link2, AlertTriangle } from "lucide-react"

interface BannerFormProps {
  banner?: Banner
  onSuccess?: () => void
}

export default function BannerForm({ banner, onSuccess }: BannerFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.image_url || null)
  const [isDragging, setIsDragging] = useState(false)
  const [formData, setFormData] = useState<BannerFormData>({
    title: banner?.title || "",
    description: banner?.description || "",
    image_url: banner?.image_url || "",
    link_url: banner?.link_url || "",
    is_active: banner?.is_active ?? true,
    display_order: banner?.display_order ?? 0,
  })

  // Reset form when banner prop changes
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        description: banner.description || "",
        image_url: banner.image_url || "",
        link_url: banner.link_url || "",
        is_active: banner.is_active ?? true,
        display_order: banner.display_order ?? 0,
      })
      setImagePreview(banner.image_url || null)
    }
  }, [banner])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_active: checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      processImageFile(file)
    }
  }

  const processImageFile = (file: File) => {
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)

    // Create a preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.title.trim()) {
        toast({
          title: "Missing title",
          description: "Please enter a banner title.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (!imageFile && !formData.image_url) {
        toast({
          title: "Missing image",
          description: "Please upload a banner image.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Upload image if a new one is selected
      let imageUrl = formData.image_url
      if (imageFile) {
        toast({
          title: "Uploading image...",
          description: "Please wait while we upload your banner image.",
        })

        imageUrl = (await bannerService.uploadBannerImage(imageFile)) || ""
        if (!imageUrl) {
          toast({
            title: "Upload failed",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      const updatedData = {
        ...formData,
        image_url: imageUrl,
      }

      let result
      if (banner) {
        // Update existing banner
        result = await bannerService.updateBanner(banner.id, updatedData)
      } else {
        // Create new banner
        result = await bannerService.createBanner(updatedData)
      }

      if (result) {
        toast({
          title: "Success!",
          description: banner ? "Banner updated successfully." : "Banner created successfully.",
          variant: "success",
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/admin/settings/banners")
          router.refresh()
        }
      }
    } catch (error: any) {
      console.error("Error saving banner:", error)
      toast({
        title: "Error",
        description: `Failed to save banner: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 md:col-span-1">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Banner Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter banner title"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Enter banner description"
              rows={3}
              className="bg-gray-800 border-gray-700 text-white resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_url" className="text-white flex items-center">
              <Link2 className="mr-2 h-4 w-4" />
              Link URL (Optional)
            </Label>
            <Input
              id="link_url"
              name="link_url"
              value={formData.link_url || ""}
              onChange={handleChange}
              placeholder="https://example.com/page"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-xs text-gray-400">Where users will go when they click the banner</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-white">
                Display Order
              </Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleChange}
                required
                min={0}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">Lower numbers appear first</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active" className="text-white block mb-2">
                Status
              </Label>
              <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-md border border-gray-700">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={handleSwitchChange}
                  className="data-[state=checked]:bg-amber-500"
                />
                <Label htmlFor="is_active" className="text-white">
                  {formData.is_active ? "Active" : "Inactive"}
                </Label>
              </div>
              <p className="text-xs text-gray-400">Only active banners are displayed</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-1">
          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <ImagePlus className="mr-2 h-4 w-4" />
              Banner Image
            </Label>

            <div
              className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                isDragging ? "border-amber-500 bg-amber-500/10" : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center py-4">
                <input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center">
                  <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-300 mb-1">
                    {imagePreview ? "Replace image" : "Upload banner image"}
                  </span>
                  <span className="text-xs text-gray-500">Drag & drop or click to browse</span>
                  <span className="text-xs text-gray-500 mt-1">JPG, PNG or WebP (max 5MB)</span>
                </label>
              </div>
            </div>

            {imagePreview && (
              <div className="mt-4 border border-gray-700 rounded-md overflow-hidden bg-gray-900">
                <div className="aspect-[16/5] relative">
                  <Image src={imagePreview || "/placeholder.svg"} alt="Banner preview" fill className="object-cover" />
                </div>
                <div className="p-2 text-xs text-gray-400 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-amber-500" />
                  This is how your banner will appear on the website
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Cancel
        </Button>
        <GamingButton type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? <Spinner className="mr-2" size="sm" /> : null}
          {banner ? "Update Banner" : "Create Banner"}
        </GamingButton>
      </div>
    </form>
  )
}
