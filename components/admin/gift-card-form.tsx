"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { giftCardService, type GiftCard } from "@/lib/gift-card-service"
import { useToast } from "@/components/ui/toast-provider"
import { GamingButton } from "@/components/ui/gaming-button"
import { Spinner } from "@/components/ui/spinner"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Minus, AlertCircle } from "lucide-react"
import { CustomFileUpload } from "@/components/admin/custom-file-upload"

interface GiftCardFormProps {
  giftCardId?: string
}

export function GiftCardForm({ giftCardId }: GiftCardFormProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!giftCardId)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<GiftCard, "id" | "created_at" | "updated_at">>({
    name: "",
    slug: "",
    image: "",
    description: "",
    is_active: true,
    denominations: [{ value: 1000, is_default: true }],
    redemption_instructions: "",
    validity_days: 365,
  })

  // Fetch gift card data if editing
  useEffect(() => {
    if (giftCardId) {
      const fetchGiftCard = async () => {
        try {
          setError(null)
          const giftCard = await giftCardService.getGiftCardById(giftCardId)
          if (giftCard) {
            setFormData({
              name: giftCard.name,
              slug: giftCard.slug,
              image: giftCard.image,
              description: giftCard.description || "",
              is_active: giftCard.is_active,
              denominations: giftCard.denominations || [{ value: 1000, is_default: true }],
              redemption_instructions: giftCard.redemption_instructions || "",
              validity_days: giftCard.validity_days,
            })
            setImagePreview(giftCard.image)
          }
        } catch (error) {
          console.error("Error fetching gift card:", error)
          setError("Failed to load gift card data. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchGiftCard()
    }
  }, [giftCardId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleImageChange = async (file: File | null) => {
    if (!file) return

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    setFormData((prev) => ({
      ...prev,
      slug,
    }))
  }

  // Gift card denomination handlers
  const handleAddDenomination = () => {
    setFormData((prev) => ({
      ...prev,
      denominations: [...prev.denominations, { value: 0, is_default: prev.denominations.length === 0 }],
    }))
  }

  const handleRemoveDenomination = (index: number) => {
    const newDenominations = formData.denominations.filter((_, i) => i !== index)

    // If we removed the default, make the first one default
    if (formData.denominations[index].is_default && newDenominations.length > 0) {
      newDenominations[0].is_default = true
    }

    setFormData((prev) => ({
      ...prev,
      denominations: newDenominations,
    }))
  }

  const handleDenominationChange = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      denominations: prev.denominations.map((denom, i) => {
        if (i === index) {
          return { ...denom, value }
        }
        return denom
      }),
    }))
  }

  const handleSetDefaultDenomination = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      denominations: prev.denominations.map((denom, i) => {
        return { ...denom, is_default: i === index }
      }),
    }))
  }

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      addToast({
        title: "Validation Error",
        description: "Gift card name is required",
        type: "error",
      })
      setActiveTab("basic")
      return false
    }

    if (!formData.slug.trim()) {
      addToast({
        title: "Validation Error",
        description: "Gift card slug is required",
        type: "error",
      })
      setActiveTab("basic")
      return false
    }

    if (!imagePreview && !imageFile) {
      addToast({
        title: "Validation Error",
        description: "Gift card image is required",
        type: "error",
      })
      setActiveTab("basic")
      return false
    }

    if (formData.denominations.length === 0) {
      addToast({
        title: "Validation Error",
        description: "Please add at least one denomination for the gift card",
        type: "error",
      })
      setActiveTab("denominations")
      return false
    }

    // Check if any denomination has zero or negative value
    const invalidDenomination = formData.denominations.find((d) => d.value <= 0)
    if (invalidDenomination) {
      addToast({
        title: "Validation Error",
        description: "All denominations must have a value greater than zero",
        type: "error",
      })
      setActiveTab("denominations")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Handle image upload if a new image was selected
      let imagePath = formData.image
      if (imageFile) {
        imagePath = (await giftCardService.uploadGiftCardImage(imageFile)) || imagePath
      }

      const giftCardData = {
        ...formData,
        image: imagePath,
      }

      let result: GiftCard | null

      if (giftCardId) {
        // Update existing gift card
        result = await giftCardService.updateGiftCard(giftCardId, giftCardData)
      } else {
        // Create new gift card
        result = await giftCardService.createGiftCard(giftCardData)
      }

      if (result) {
        addToast({
          title: giftCardId ? "Gift card updated" : "Gift card created",
          description: giftCardId
            ? "The gift card has been updated successfully."
            : "The gift card has been created successfully.",
          type: "success",
        })
        router.push("/admin/gift-cards")
      } else {
        throw new Error("Failed to save gift card")
      }
    } catch (error) {
      console.error("Error saving gift card:", error)
      setError("Failed to save gift card. Please try again.")
      addToast({
        title: "Error",
        description: "Failed to save gift card. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 rounded-md bg-red-500/10 p-4 border border-red-500/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-500">{error}</p>
          </div>
          <GamingButton
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-red-500 hover:text-red-400"
            onClick={() => setError(null)}
          >
            Dismiss
          </GamingButton>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="denominations">Denominations</TabsTrigger>
          <TabsTrigger value="redemption">Redemption</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Gift Card Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => !formData.slug && generateSlug()}
                  required
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Slug</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <GamingButton type="button" variant="outline" onClick={generateSlug}>
                    Generate
                  </GamingButton>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-white">Gift Card Image</label>
                <CustomFileUpload
                  initialImage={imagePreview}
                  onFileChange={handleImageChange}
                  accept="image/*"
                  preview={imagePreview}
                  previewAlt={formData.name || "Gift Card Preview"}
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-white">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-border bg-background text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-white">
                  Active
                </label>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="denominations">
          <Card className="p-6 border-border bg-card">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Gift Card Denominations</h3>
              <GamingButton type="button" variant="amber" size="sm" onClick={handleAddDenomination} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Denomination
              </GamingButton>
            </div>

            {formData.denominations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No denominations added yet. Click "Add Denomination" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {formData.denominations.map((denom, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-md border border-border">
                    <div className="flex-1">
                      <label className="block mb-1 text-xs text-gray-400">Value (NPR)</label>
                      <input
                        type="number"
                        value={denom.value}
                        onChange={(e) => handleDenominationChange(index, Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        required
                        className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    <div className="flex items-center mt-6">
                      <input
                        type="radio"
                        id={`default-${index}`}
                        checked={denom.is_default}
                        onChange={() => handleSetDefaultDenomination(index)}
                        className="h-4 w-4 border-border bg-background text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor={`default-${index}`} className="ml-2 text-sm text-white">
                        Default
                      </label>
                    </div>

                    <GamingButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDenomination(index)}
                      className="mt-6 h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      disabled={formData.denominations.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </GamingButton>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="redemption">
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Validity (Days)</label>
                <input
                  type="number"
                  name="validity_days"
                  value={formData.validity_days}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-white">Redemption Instructions</label>
                <textarea
                  name="redemption_instructions"
                  value={formData.redemption_instructions}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Instructions on how to redeem this gift card..."
                ></textarea>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-3">
        <GamingButton
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/gift-cards")}
          disabled={isSubmitting}
        >
          Cancel
        </GamingButton>
        <GamingButton type="submit" variant="amber" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {giftCardId ? "Updating..." : "Creating..."}
            </>
          ) : giftCardId ? (
            "Update Gift Card"
          ) : (
            "Create Gift Card"
          )}
        </GamingButton>
      </div>
    </form>
  )
}
