"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { productService } from "@/lib/product-service"
import { categoryService, type Category } from "@/lib/category-service"
import { useToast } from "@/components/ui/toast-provider"
import { GamingButton } from "@/components/ui/gaming-button"
import { Spinner } from "@/components/ui/spinner"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, Minus, Upload, X, AlertCircle, Info } from "lucide-react"
import { uploadProductImage, saveProduct } from "@/app/actions/product-actions"

interface ProductFormProps {
  productId?: string
}

// Export both as default and named export to ensure compatibility
const ProductForm = ({ productId }: ProductFormProps) => {
  // Component implementation remains the same
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!!productId)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null)

  // Product type selection
  const [productType, setProductType] = useState<"standard" | "gift_card" | "streaming" | "game_points" | "software">(
    "standard",
  )

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    min_price: 0,
    max_price: 0,
    category: "",
    in_stock: true,
    stock: 100,
    is_new: false,
    is_featured: false,
    is_digital: false,
    // Gift card specific
    redemption_instructions: "",
    validity_days: 365,
    // Game specific
    platform: "",
    release_date: "",
    publisher: "",
    genre: "",
    // Software specific
    product_code: "",
    region: "Global",
    system_requirements: "",
    // Game points specific
    points_amount: 0,
    bonus_points: 0,
    game_service: "",
  })

  // Streaming plans state
  const [plans, setPlans] = useState<
    Array<{
      id?: string
      plan_id: string
      name: string
      screens: number
      quality: string
      description: string
      durations: Array<{
        id?: string
        duration_id: string
        name: string
        months: number
        price: number
        discount: number
      }>
    }>
  >([])

  // Gift card denominations
  const [denominations, setDenominations] = useState<Array<{ value: number; is_default: boolean }>>([
    { value: 1000, is_default: true },
  ])

  // Software license types
  const [licenseTypes, setLicenseTypes] = useState<Array<{ name: string; duration: string; price: number }>>([
    { name: "Standard", duration: "Lifetime", price: 0 },
  ])

  // Game editions
  const [editions, setEditions] = useState<Array<{ name: string; description: string; price: number }>>([
    { name: "Standard Edition", description: "Base game", price: 0 },
  ])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await categoryService.getCategories()
        setCategories(allCategories)

        const parentCats = await categoryService.getParentCategories()
        setParentCategories(parentCats)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Update subcategories when parent category changes
  useEffect(() => {
    if (selectedParentCategory) {
      const fetchSubcategories = async () => {
        try {
          const subs = await categoryService.getSubcategories(selectedParentCategory)
          setSubcategories(subs)
        } catch (error) {
          console.error("Error fetching subcategories:", error)
        }
      }

      fetchSubcategories()
    } else {
      setSubcategories([])
    }
  }, [selectedParentCategory])

  // Fetch product data if editing
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          setError(null)
          const product = await productService.getProductById(productId)
          if (product) {
            // Determine product type
            let type: "standard" | "gift_card" | "streaming" | "game_points" | "software" = "standard"

            // Find the category in our categories list
            const productCategory = categories.find((cat) => cat.id === product.category)

            // If we found the category, check its parent to determine product type
            if (productCategory) {
              if (productCategory.parent_id) {
                // It's a subcategory, so find the parent
                const parentCategory = categories.find((cat) => cat.id === productCategory.parent_id)
                if (parentCategory) {
                  setSelectedParentCategory(parentCategory.id)

                  // Determine product type based on parent category slug
                  if (parentCategory.slug === "gift-cards") {
                    type = "gift_card"
                  } else if (parentCategory.slug === "streaming-services") {
                    type = "streaming"
                  } else if (parentCategory.slug === "game-points") {
                    type = "game_points"
                  } else if (parentCategory.slug === "software") {
                    type = "software"
                  }
                }
              } else {
                // It's a parent category
                setSelectedParentCategory(productCategory.id)

                // Determine product type based on category slug
                if (productCategory.slug === "gift-cards") {
                  type = "gift_card"
                } else if (productCategory.slug === "streaming-services") {
                  type = "streaming"
                } else if (productCategory.slug === "game-points") {
                  type = "game_points"
                } else if (productCategory.slug === "software") {
                  type = "software"
                }
              }
            }

            setProductType(type)

            setFormData({
              name: product.name,
              description: product.description || "",
              price: product.price,
              original_price: product.original_price || 0,
              min_price: product.min_price || 0,
              max_price: product.max_price || 0,
              category: product.category,
              in_stock: product.in_stock !== false,
              stock: product.stock || 100,
              is_new: product.is_new || false,
              is_featured: product.featured || false,
              is_digital: product.is_digital || false,
              // Gift card specific
              redemption_instructions: product.redemption_instructions || "",
              validity_days: product.validity_days || 365,
              // Game specific
              platform: product.platform || "",
              release_date: product.release_date || "",
              publisher: product.publisher || "",
              genre: product.genre || "",
              // Software specific
              product_code: product.product_code || "",
              region: product.region || "Global",
              system_requirements: product.system_requirements || "",
              // Game points specific
              points_amount: product.points_amount || 0,
              bonus_points: product.bonus_points || 0,
              game_service: product.game_service || "",
            })

            setImagePreview(product.image)

            // Load denominations if it's a gift card
            if (type === "gift_card" && product.denominations) {
              setDenominations(product.denominations)
            }

            // Load license types if it's software
            if (type === "software" && product.license_types) {
              setLicenseTypes(product.license_types)
            }

            // Load editions if it's a game
            if (product.editions) {
              setEditions(product.editions)
            }
          }

          // Fetch streaming plans and durations if needed
          if (product?.category === "Streaming Services") {
            try {
              const streamingPlans = await productService.getStreamingPlans(productId)

              if (streamingPlans && streamingPlans.length > 0) {
                // Map plans and durations
                const mappedPlans = streamingPlans.map((plan) => {
                  return {
                    id: plan.id,
                    plan_id: plan.plan_id || plan.id,
                    name: plan.name,
                    screens: plan.screens,
                    quality: plan.quality,
                    description: plan.description,
                    durations: plan.durations.map((d) => ({
                      id: d.id,
                      duration_id: d.duration_id || d.id,
                      name: d.name,
                      months: d.months,
                      price: d.price,
                      discount: d.discount || 0,
                    })),
                  }
                })

                setPlans(mappedPlans)
              }
            } catch (planError) {
              console.error("Error fetching streaming plans:", planError)
              // Don't fail the whole form if plans can't be loaded
            }
          }
        } catch (error) {
          console.error("Error fetching product:", error)
          setError("Failed to load product data. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProduct()
    }
  }, [productId, categories])

  // Set default category based on product type
  useEffect(() => {
    if (!productId) {
      // Find the appropriate parent category based on product type
      let parentCategorySlug = ""

      switch (productType) {
        case "gift_card":
          parentCategorySlug = "gift-cards"
          break
        case "streaming":
          parentCategorySlug = "streaming-services"
          break
        case "game_points":
          parentCategorySlug = "game-points"
          break
        case "software":
          parentCategorySlug = "software"
          break
        case "standard":
          parentCategorySlug = "xbox-games" // Default to Xbox Games for standard products
          break
      }

      // Find the parent category ID
      const parentCategory = parentCategories.find((cat) => cat.slug === parentCategorySlug)
      if (parentCategory) {
        setSelectedParentCategory(parentCategory.id)
      }

      setFormData((prev) => ({
        ...prev,
        is_digital: ["streaming", "software", "game_points", "gift_card"].includes(productType),
      }))
    }
  }, [productType, productId, parentCategories])

  // Add empty plan if none exist for streaming
  useEffect(() => {
    if (plans.length === 0 && productType === "streaming") {
      setPlans([
        {
          plan_id: "basic",
          name: "Basic",
          screens: 1,
          quality: "SD",
          description: "Basic plan",
          durations: [
            {
              duration_id: "1month",
              name: "1 Month",
              months: 1,
              price: 1999,
              discount: 0,
            },
          ],
        },
      ])
    }
  }, [productType, plans.length])

  const handleProductTypeChange = (type: "standard" | "gift_card" | "streaming" | "game_points" | "software") => {
    setProductType(type)

    // Reset specific fields when changing product type
    if (type === "gift_card" && denominations.length === 0) {
      setDenominations([{ value: 1000, is_default: true }])
    } else if (type === "streaming" && plans.length === 0) {
      setPlans([
        {
          plan_id: "basic",
          name: "Basic",
          screens: 1,
          quality: "SD",
          description: "Basic plan",
          durations: [
            {
              duration_id: "1month",
              name: "1 Month",
              months: 1,
              price: 1999,
              discount: 0,
            },
          ],
        },
      ])
    } else if (type === "software" && licenseTypes.length === 0) {
      setLicenseTypes([{ name: "Standard", duration: "Lifetime", price: 0 }])
    }
  }

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

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleParentCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value
    setSelectedParentCategory(parentId)

    // Reset the category selection
    setFormData((prev) => ({
      ...prev,
      category: "",
    }))
  }

  // Streaming plans handlers
  const handleAddPlan = () => {
    setPlans([
      ...plans,
      {
        plan_id: `plan-${Date.now()}`,
        name: `Plan ${plans.length + 1}`,
        screens: 1,
        quality: "SD",
        description: "",
        durations: [
          {
            duration_id: `duration-${Date.now()}`,
            name: "1 Month",
            months: 1,
            price: 1999,
            discount: 0,
          },
        ],
      },
    ])
  }

  const handleRemovePlan = (index: number) => {
    setPlans(plans.filter((_, i) => i !== index))
  }

  const handlePlanChange = (index: number, field: string, value: any) => {
    setPlans(
      plans.map((plan, i) => {
        if (i === index) {
          return { ...plan, [field]: value }
        }
        return plan
      }),
    )
  }

  const handleAddDuration = (planIndex: number) => {
    setPlans(
      plans.map((plan, i) => {
        if (i === planIndex) {
          return {
            ...plan,
            durations: [
              ...plan.durations,
              {
                duration_id: `duration-${Date.now()}`,
                name: `${plan.durations.length + 1} Months`,
                months: plan.durations.length + 1,
                price: 1999,
                discount: 0,
              },
            ],
          }
        }
        return plan
      }),
    )
  }

  const handleRemoveDuration = (planIndex: number, durationIndex: number) => {
    setPlans(
      plans.map((plan, i) => {
        if (i === planIndex) {
          return {
            ...plan,
            durations: plan.durations.filter((_, j) => j !== durationIndex),
          }
        }
        return plan
      }),
    )
  }

  const handleDurationChange = (planIndex: number, durationIndex: number, field: string, value: any) => {
    setPlans(
      plans.map((plan, i) => {
        if (i === planIndex) {
          return {
            ...plan,
            durations: plan.durations.map((duration, j) => {
              if (j === durationIndex) {
                return {
                  ...duration,
                  [field]:
                    field === "price" || field === "discount" || field === "months"
                      ? Number.parseFloat(value) || 0
                      : value,
                }
              }
              return duration
            }),
          }
        }
        return plan
      }),
    )
  }

  // Gift card denomination handlers
  const handleAddDenomination = () => {
    setDenominations([...denominations, { value: 0, is_default: denominations.length === 0 }])
  }

  const handleRemoveDenomination = (index: number) => {
    const newDenominations = denominations.filter((_, i) => i !== index)

    // If we removed the default, make the first one default
    if (denominations[index].is_default && newDenominations.length > 0) {
      newDenominations[0].is_default = true
    }

    setDenominations(newDenominations)
  }

  const handleDenominationChange = (index: number, value: number) => {
    setDenominations(
      denominations.map((denom, i) => {
        if (i === index) {
          return { ...denom, value }
        }
        return denom
      }),
    )
  }

  const handleSetDefaultDenomination = (index: number) => {
    setDenominations(
      denominations.map((denom, i) => {
        return { ...denom, is_default: i === index }
      }),
    )
  }

  // Software license handlers
  const handleAddLicenseType = () => {
    setLicenseTypes([...licenseTypes, { name: "", duration: "Lifetime", price: 0 }])
  }

  const handleRemoveLicenseType = (index: number) => {
    setLicenseTypes(licenseTypes.filter((_, i) => i !== index))
  }

  const handleLicenseTypeChange = (index: number, field: string, value: any) => {
    setLicenseTypes(
      licenseTypes.map((license, i) => {
        if (i === index) {
          return { ...license, [field]: field === "price" ? Number.parseFloat(value) || 0 : value }
        }
        return license
      }),
    )
  }

  // Game edition handlers
  const handleAddEdition = () => {
    setEditions([...editions, { name: "", description: "", price: 0 }])
  }

  const handleRemoveEdition = (index: number) => {
    setEditions(editions.filter((_, i) => i !== index))
  }

  const handleEditionChange = (index: number, field: string, value: any) => {
    setEditions(
      editions.map((edition, i) => {
        if (i === index) {
          return { ...edition, [field]: field === "price" ? Number.parseFloat(value) || 0 : value }
        }
        return edition
      }),
    )
  }

  const validateForm = () => {
    // Basic validation
    if (!formData.name.trim()) {
      addToast({
        title: "Validation Error",
        description: "Product name is required",
        type: "error",
      })
      setActiveTab("basic")
      return false
    }

    if (!formData.category) {
      addToast({
        title: "Validation Error",
        description: "Please select a category",
        type: "error",
      })
      setActiveTab("basic")
      return false
    }

    if (formData.price <= 0 && productType === "standard") {
      addToast({
        title: "Validation Error",
        description: "Price must be greater than zero",
        type: "error",
      })
      setActiveTab("pricing")
      return false
    }

    // Gift card validation
    if (productType === "gift_card") {
      if (denominations.length === 0) {
        addToast({
          title: "Validation Error",
          description: "Please add at least one denomination for the gift card",
          type: "error",
        })
        setActiveTab("gift-card")
        return false
      }

      // Check if any denomination has zero or negative value
      const invalidDenomination = denominations.find((d) => d.value <= 0)
      if (invalidDenomination) {
        addToast({
          title: "Validation Error",
          description: "All denominations must have a value greater than zero",
          type: "error",
        })
        setActiveTab("gift-card")
        return false
      }
    }

    // Streaming service validation
    if (productType === "streaming") {
      if (plans.length === 0) {
        addToast({
          title: "Validation Error",
          description: "Please add at least one plan for the streaming service",
          type: "error",
        })
        setActiveTab("streaming")
        return false
      }

      // Check if any plan has no durations
      const invalidPlan = plans.find((p) => p.durations.length === 0)
      if (invalidPlan) {
        addToast({
          title: "Validation Error",
          description: `Plan "${invalidPlan.name}" must have at least one duration`,
          type: "error",
        })
        setActiveTab("streaming")
        return false
      }
    }

    // Software validation
    if (productType === "software") {
      if (licenseTypes.length === 0) {
        addToast({
          title: "Validation Error",
          description: "Please add at least one license type for the software",
          type: "error",
        })
        setActiveTab("software")
        return false
      }

      // Check if any license type has no name
      const invalidLicense = licenseTypes.find((l) => !l.name.trim())
      if (invalidLicense) {
        addToast({
          title: "Validation Error",
          description: "All license types must have a name",
          type: "error",
        })
        setActiveTab("software")
        return false
      }
    }

    // Game points validation
    if (productType === "game_points") {
      if (formData.points_amount <= 0) {
        addToast({
          title: "Validation Error",
          description: "Points amount must be greater than zero",
          type: "error",
        })
        setActiveTab("game-points")
        return false
      }

      if (!formData.game_service) {
        addToast({
          title: "Validation Error",
          description: "Please select a game service",
          type: "error",
        })
        setActiveTab("game-points")
        return false
      }
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
      // Prepare product data
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price || null,
        min_price: formData.min_price || null,
        max_price: formData.max_price || null,
        category: formData.category,
        in_stock: formData.in_stock,
        stock: formData.stock,
        is_new: formData.is_new,
        featured: formData.is_featured,
        is_digital: formData.is_digital,
        image: imagePreview || "/placeholder.svg?height=200&width=200",
      }

      // Add product type specific fields
      switch (productType) {
        case "gift_card":
          productData.is_gift_card = true
          productData.denominations = denominations
          productData.redemption_instructions = formData.redemption_instructions
          productData.validity_days = formData.validity_days
          break

        case "streaming":
          productData.is_subscription = true
          break

        case "software":
          productData.license_types = licenseTypes
          productData.product_code = formData.product_code
          productData.region = formData.region
          productData.system_requirements = formData.system_requirements
          break

        case "game_points":
          productData.points_amount = formData.points_amount
          productData.bonus_points = formData.bonus_points
          productData.game_service = formData.game_service
          break

        case "standard":
          productData.platform = formData.platform
          productData.release_date = formData.release_date
          productData.publisher = formData.publisher
          productData.genre = formData.genre
          productData.editions = editions
          break
      }

      let newProductId = productId

      // Handle image upload if a new image was selected
      if (imageFile) {
        try {
          const formData = new FormData()
          formData.append("image", imageFile)

          const uploadResult = await uploadProductImage(formData)

          if (uploadResult.error) {
            throw new Error(uploadResult.error)
          }

          if (uploadResult.url) {
            productData.image = uploadResult.url
          }
        } catch (imageError) {
          console.error("Error processing image:", imageError)
          addToast({
            title: "Warning",
            description: "Product saved, but there was an issue with the image upload.",
            type: "warning",
          })
        }
      }

      // Save the product
      const saveResult = await saveProduct(productData, productId)

      if (saveResult.error) {
        throw new Error(saveResult.error)
      }

      newProductId = saveResult.id || productId

      // Handle streaming plans if applicable
      if (productType === "streaming" && newProductId) {
        try {
          await productService.saveStreamingPlans(newProductId, plans)
        } catch (planError) {
          console.error("Error saving streaming plans:", planError)
          // Don't fail the whole submission if plans can't be saved
          addToast({
            title: "Warning",
            description: "Product saved, but there was an issue saving streaming plans.",
            type: "warning",
          })
        }
      }

      addToast({
        title: productId ? "Product updated" : "Product created",
        description: productId
          ? "The product has been updated successfully."
          : "The product has been created successfully.",
        type: "success",
      })

      router.push("/admin/products")
    } catch (error) {
      console.error("Error saving product:", error)
      setError("Failed to save product. Please try again.")
      addToast({
        title: "Error",
        description: "Failed to save product. Please try again.",
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

      {/* Product Type Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Product Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div
            className={`cursor-pointer rounded-lg border p-4 text-center transition-colors ${
              productType === "standard"
                ? "border-amber-500 bg-amber-500/10"
                : "border-border hover:border-amber-500/50"
            }`}
            onClick={() => handleProductTypeChange("standard")}
          >
            <div className="font-medium text-white">Standard</div>
            <div className="text-xs text-gray-400 mt-1">Games, Accessories</div>
          </div>

          <div
            className={`cursor-pointer rounded-lg border p-4 text-center transition-colors ${
              productType === "gift_card"
                ? "border-amber-500 bg-amber-500/10"
                : "border-border hover:border-amber-500/50"
            }`}
            onClick={() => handleProductTypeChange("gift_card")}
          >
            <div className="font-medium text-white">Gift Card</div>
            <div className="text-xs text-gray-400 mt-1">Multiple denominations</div>
          </div>

          <div
            className={`cursor-pointer rounded-lg border p-4 text-center transition-colors ${
              productType === "streaming"
                ? "border-amber-500 bg-amber-500/10"
                : "border-border hover:border-amber-500/50"
            }`}
            onClick={() => handleProductTypeChange("streaming")}
          >
            <div className="font-medium text-white">Streaming</div>
            <div className="text-xs text-gray-400 mt-1">Subscription plans</div>
          </div>

          <div
            className={`cursor-pointer rounded-lg border p-4 text-center transition-colors ${
              productType === "game_points"
                ? "border-amber-500 bg-amber-500/10"
                : "border-border hover:border-amber-500/50"
            }`}
            onClick={() => handleProductTypeChange("game_points")}
          >
            <div className="font-medium text-white">Game Points</div>
            <div className="text-xs text-gray-400 mt-1">In-game currency</div>
          </div>

          <div
            className={`cursor-pointer rounded-lg border p-4 text-center transition-colors ${
              productType === "software"
                ? "border-amber-500 bg-amber-500/10"
                : "border-border hover:border-amber-500/50"
            }`}
            onClick={() => handleProductTypeChange("software")}
          >
            <div className="font-medium text-white">Software</div>
            <div className="text-xs text-gray-400 mt-1">License keys</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="streaming" disabled={productType !== "streaming"}>
            Streaming Plans
          </TabsTrigger>
          <TabsTrigger value="gift-card" disabled={productType !== "gift_card"}>
            Gift Card
          </TabsTrigger>
          <TabsTrigger value="software" disabled={productType !== "software"}>
            Software
          </TabsTrigger>
          <TabsTrigger value="game-points" disabled={productType !== "game_points"}>
            Game Points
          </TabsTrigger>
          <TabsTrigger value="game-details" disabled={productType !== "standard"}>
            Game Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-white">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Parent Category</label>
                <select
                  value={selectedParentCategory || ""}
                  onChange={handleParentCategoryChange}
                  required
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select Parent Category</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select Category</option>
                  {selectedParentCategory && (
                    <>
                      {/* Include the parent category itself as an option */}
                      <option value={selectedParentCategory}>
                        {parentCategories.find((cat) => cat.id === selectedParentCategory)?.name || "Parent Category"}
                      </option>

                      {/* Include all subcategories */}
                      {subcategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Product Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-md border border-border">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
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

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="col-span-2 flex flex-wrap gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in_stock"
                    name="in_stock"
                    checked={formData.in_stock}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-border bg-background text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="in_stock" className="ml-2 text-sm text-white">
                    In Stock
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_new"
                    name="is_new"
                    checked={formData.is_new}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-border bg-background text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="is_new" className="ml-2 text-sm text-white">
                    New Product
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-border bg-background text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="is_featured" className="ml-2 text-sm text-white">
                    Featured Product
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_digital"
                    name="is_digital"
                    checked={formData.is_digital}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-border bg-background text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="is_digital" className="ml-2 text-sm text-white">
                    Digital Product
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Price (NPR)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required={productType === "standard"}
                  min="0"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {(productType === "gift_card" || productType === "streaming") && (
                  <p className="mt-1 text-xs text-gray-400">
                    {productType === "gift_card"
                      ? "For gift cards, this is the default price. You can set denominations in the Gift Card tab."
                      : "For subscriptions, prices are set per plan and duration in the Streaming Plans tab."}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Original Price (NPR, optional)</label>
                <input
                  type="number"
                  name="original_price"
                  value={formData.original_price || ""}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Used to show discounts. Leave empty if there's no discount.
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Minimum Price (NPR, for price ranges)
                </label>
                <input
                  type="number"
                  name="min_price"
                  value={formData.min_price || ""}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <p className="mt-1 text-xs text-gray-400">
                  For products with multiple options/variants. Leave empty if not applicable.
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Maximum Price (NPR, for price ranges)
                </label>
                <input
                  type="number"
                  name="max_price"
                  value={formData.max_price || ""}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <p className="mt-1 text-xs text-gray-400">
                  For products with multiple options/variants. Leave empty if not applicable.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="streaming">
          <Card className="p-6 border-border bg-card">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Streaming Plans</h3>
              <GamingButton type="button" variant="amber" size="sm" onClick={handleAddPlan} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Plan
              </GamingButton>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No streaming plans added yet. Click "Add Plan" to create one.
              </div>
            ) : (
              <div className="space-y-8">
                {plans.map((plan, planIndex) => (
                  <div key={planIndex} className="rounded-md border border-border p-4">
                    <div className="mb-4 flex justify-between items-center">
                      <h4 className="font-medium text-white">Plan #{planIndex + 1}</h4>
                      <GamingButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlan(planIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Minus className="h-4 w-4" />
                        Remove Plan
                      </GamingButton>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-xs font-medium text-white">Plan ID</label>
                        <input
                          type="text"
                          value={plan.plan_id}
                          onChange={(e) => handlePlanChange(planIndex, "plan_id", e.target.value)}
                          required
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-xs font-medium text-white">Plan Name</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handlePlanChange(planIndex, "name", e.target.value)}
                          required
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-xs font-medium text-white">Screens</label>
                        <input
                          type="number"
                          value={plan.screens}
                          onChange={(e) => handlePlanChange(planIndex, "screens", Number.parseInt(e.target.value))}
                          required
                          min="1"
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-xs font-medium text-white">Quality</label>
                        <select
                          value={plan.quality}
                          onChange={(e) => handlePlanChange(planIndex, "quality", e.target.value)}
                          required
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        >
                          <option value="SD">SD</option>
                          <option value="HD">HD</option>
                          <option value="UHD">UHD (4K)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block mb-2 text-xs font-medium text-white">Description</label>
                        <input
                          type="text"
                          value={plan.description}
                          onChange={(e) => handlePlanChange(planIndex, "description", e.target.value)}
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>

                    {/* Durations */}
                    <div className="mt-6">
                      <div className="mb-4 flex justify-between items-center">
                        <h5 className="text-sm font-medium text-white">Durations</h5>
                        <GamingButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddDuration(planIndex)}
                          className="gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Add Duration
                        </GamingButton>
                      </div>

                      {plan.durations.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No durations added yet. Click "Add Duration" to create one.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {plan.durations.map((duration, durationIndex) => (
                            <div key={durationIndex} className="rounded-md border border-border p-3 bg-muted/30">
                              <div className="mb-3 flex justify-between items-center">
                                <h6 className="text-xs font-medium text-white">Duration #{durationIndex + 1}</h6>
                                <GamingButton
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveDuration(planIndex, durationIndex)}
                                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                                >
                                  <Minus className="h-3 w-3" />
                                </GamingButton>
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <label className="block mb-1 text-xs text-gray-400">Duration ID</label>
                                  <input
                                    type="text"
                                    value={duration.duration_id}
                                    onChange={(e) =>
                                      handleDurationChange(planIndex, durationIndex, "duration_id", e.target.value)
                                    }
                                    required
                                    className="w-full rounded-md border border-border bg-background p-1.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 text-xs text-gray-400">Name</label>
                                  <input
                                    type="text"
                                    value={duration.name}
                                    onChange={(e) =>
                                      handleDurationChange(planIndex, durationIndex, "name", e.target.value)
                                    }
                                    required
                                    className="w-full rounded-md border border-border bg-background p-1.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 text-xs text-gray-400">Months</label>
                                  <input
                                    type="number"
                                    value={duration.months}
                                    onChange={(e) =>
                                      handleDurationChange(
                                        planIndex,
                                        durationIndex,
                                        "months",
                                        Number.parseInt(e.target.value),
                                      )
                                    }
                                    required
                                    min="1"
                                    className="w-full rounded-md border border-border bg-background p-1.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 text-xs text-gray-400">Price (NPR)</label>
                                  <input
                                    type="number"
                                    value={duration.price}
                                    onChange={(e) =>
                                      handleDurationChange(
                                        planIndex,
                                        durationIndex,
                                        "price",
                                        Number.parseInt(e.target.value),
                                      )
                                    }
                                    required
                                    min="0"
                                    className="w-full rounded-md border border-border bg-background p-1.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 text-xs text-gray-400">Discount (%)</label>
                                  <input
                                    type="number"
                                    value={duration.discount}
                                    onChange={(e) =>
                                      handleDurationChange(
                                        planIndex,
                                        durationIndex,
                                        "discount",
                                        Number.parseInt(e.target.value),
                                      )
                                    }
                                    required
                                    min="0"
                                    max="100"
                                    className="w-full rounded-md border border-border bg-background p-1.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="gift-card">
          <Card className="p-6 border-border bg-card">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Gift Card Details</h3>
              <GamingButton type="button" variant="amber" size="sm" onClick={handleAddDenomination} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Denomination
              </GamingButton>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-white">Redemption Instructions</label>
                <textarea
                  name="redemption_instructions"
                  value={formData.redemption_instructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Instructions on how to redeem this gift card..."
                ></textarea>
              </div>

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
            </div>

            <h4 className="text-md font-medium text-white mb-4">Denominations</h4>

            {denominations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No denominations added yet. Click "Add Denomination" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {denominations.map((denom, index) => (
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
                      disabled={denominations.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </GamingButton>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="software">
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Product Code</label>
                <input
                  type="text"
                  name="product_code"
                  value={formData.product_code}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="e.g., MS-OFFICE-2023"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="Global">Global</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block mb-2 text-sm font-medium text-white">System Requirements</label>
                <textarea
                  name="system_requirements"
                  value={formData.system_requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Minimum and recommended system requirements..."
                ></textarea>
              </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">License Types</h3>
              <GamingButton type="button" variant="amber" size="sm" onClick={handleAddLicenseType} className="gap-1">
                <Plus className="h-4 w-4" />
                Add License Type
              </GamingButton>
            </div>

            {licenseTypes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No license types added yet. Click "Add License Type" to create one.
              </div>
            ) : (
              <div className="space-y-4">
                {licenseTypes.map((license, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded-md border border-border"
                  >
                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Name</label>
                      <input
                        type="text"
                        value={license.name}
                        onChange={(e) => handleLicenseTypeChange(index, "name", e.target.value)}
                        required
                        className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        placeholder="e.g., Standard, Professional, Enterprise"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs text-gray-400">Duration</label>
                      <select
                        value={license.duration}
                        onChange={(e) => handleLicenseTypeChange(index, "duration", e.target.value)}
                        className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      >
                        <option value="Lifetime">Lifetime</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2 Years">2 Years</option>
                        <option value="3 Years">3 Years</option>
                        <option value="Monthly">Monthly Subscription</option>
                        <option value="Annual">Annual Subscription</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block mb-1 text-xs text-gray-400">Price (NPR)</label>
                        <input
                          type="number"
                          value={license.price}
                          onChange={(e) => handleLicenseTypeChange(index, "price", e.target.value)}
                          min="0"
                          required
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>

                      <GamingButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLicenseType(index)}
                        className="mt-6 h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        disabled={licenseTypes.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </GamingButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="game-points">
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Game Service</label>
                <select
                  name="game_service"
                  value={formData.game_service}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select Game Service</option>
                  <option value="Xbox Live">Xbox Live</option>
                  <option value="PlayStation Network">PlayStation Network</option>
                  <option value="Steam">Steam</option>
                  <option value="Epic Games">Epic Games</option>
                  <option value="Nintendo eShop">Nintendo eShop</option>
                  <option value="Roblox">Roblox</option>
                  <option value="Minecraft">Minecraft</option>
                  <option value="Fortnite">Fortnite</option>
                  <option value="PUBG">PUBG</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Points Amount</label>
                <input
                  type="number"
                  name="points_amount"
                  value={formData.points_amount}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Bonus Points</label>
                <input
                  type="number"
                  name="bonus_points"
                  value={formData.bonus_points}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <p className="mt-1 text-xs text-gray-400">Additional bonus points included with the purchase.</p>
              </div>

              <div className="col-span-2 flex items-start gap-2 p-3 rounded-md border border-border bg-amber-500/10">
                <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white">
                    Game points are digital currency for specific gaming platforms. Make sure to include clear
                    redemption instructions in the product description.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="game-details">
          <Card className="p-6 border-border bg-card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-white">Platform</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select Platform</option>
                  <option value="Xbox Series X|S">Xbox Series X|S</option>
                  <option value="Xbox One">Xbox One</option>
                  <option value="PlayStation 5">PlayStation 5</option>
                  <option value="PlayStation 4">PlayStation 4</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                  <option value="PC">PC</option>
                  <option value="Multiple">Multiple Platforms</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Genre</label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">Select Genre</option>
                  <option value="Action">Action</option>
                  <option value="Adventure">Adventure</option>
                  <option value="RPG">RPG</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Sports">Sports</option>
                  <option value="Racing">Racing</option>
                  <option value="Fighting">Fighting</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Puzzle">Puzzle</option>
                  <option value="Platformer">Platformer</option>
                  <option value="Horror">Horror</option>
                  <option value="Open World">Open World</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Release Date</label>
                <input
                  type="date"
                  name="release_date"
                  value={formData.release_date}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-border bg-background p-3 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Game Editions</h3>
                <GamingButton type="button" variant="amber" size="sm" onClick={handleAddEdition} className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Edition
                </GamingButton>
              </div>

              {editions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No editions added yet. Click "Add Edition" to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {editions.map((edition, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded-md border border-border"
                    >
                      <div>
                        <label className="block mb-1 text-xs text-gray-400">Edition Name</label>
                        <input
                          type="text"
                          value={edition.name}
                          onChange={(e) => handleEditionChange(index, "name", e.target.value)}
                          required
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          placeholder="e.g., Standard, Deluxe, Ultimate"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs text-gray-400">Description</label>
                        <input
                          type="text"
                          value={edition.description}
                          onChange={(e) => handleEditionChange(index, "description", e.target.value)}
                          className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          placeholder="What's included in this edition"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block mb-1 text-xs text-gray-400">Price (NPR)</label>
                          <input
                            type="number"
                            value={edition.price}
                            onChange={(e) => handleEditionChange(index, "price", e.target.value)}
                            min="0"
                            required
                            className="w-full rounded-md border border-border bg-background p-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>

                        <GamingButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEdition(index)}
                          className="mt-6 h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          disabled={editions.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </GamingButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end gap-3">
        <GamingButton
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
          disabled={isSubmitting}
        >
          Cancel
        </GamingButton>
        <GamingButton type="submit" variant="amber" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {productId ? "Updating..." : "Creating..."}
            </>
          ) : productId ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </GamingButton>
      </div>
    </form>
  )
}

// Export both as default and named export to ensure compatibility
export default ProductForm
export { ProductForm }
