"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { productService } from "@/lib/enhanced-product-service"
import { categoryService } from "@/lib/category-service"
import { useToast } from "@/components/ui/toast-provider"
import type {
  Product,
  GiftCardDenomination,
  SoftwareLicense,
  GameEdition,
  StreamingPlan,
  ProductType,
  Category,
} from "@/types/product"

interface UseProductFormProps {
  productId?: string
}

export function useProductForm({ productId }: UseProductFormProps = {}) {
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!!productId)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [parentCategories, setParentCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null)

  // Product type selection
  const [productType, setProductType] = useState<ProductType>("standard")

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
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
    featured: false,
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
  const [plans, setPlans] = useState<StreamingPlan[]>([])

  // Gift card denominations
  const [denominations, setDenominations] = useState<GiftCardDenomination[]>([{ value: 1000, is_default: true }])

  // Software license types
  const [licenseTypes, setLicenseTypes] = useState<SoftwareLicense[]>([
    { name: "Standard", duration: "Lifetime", price: 0 },
  ])

  // Game editions
  const [editions, setEditions] = useState<GameEdition[]>([
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
            let type: ProductType = "standard"

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
            setFormData(product)
            setImagePreview(product.image || null)

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

          // Fetch streaming plans if needed
          if (product?.is_subscription) {
            try {
              const streamingPlans = await productService.getStreamingPlans(productId)
              if (streamingPlans && streamingPlans.length > 0) {
                setPlans(streamingPlans)
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
          product_id: "",
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

  const handleProductTypeChange = (type: ProductType) => {
    setProductType(type)

    // Reset specific fields when changing product type
    if (type === "gift_card" && denominations.length === 0) {
      setDenominations([{ value: 1000, is_default: true }])
    } else if (type === "streaming" && plans.length === 0) {
      setPlans([
        {
          product_id: "",
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

  const validateForm = () => {
    // Basic validation
    if (!formData.name?.trim()) {
      addToast({
        title: "Validation Error",
        description: "Product name is required",
        type: "error",
      })
      return false
    }

    if (!formData.category) {
      addToast({
        title: "Validation Error",
        description: "Please select a category",
        type: "error",
      })
      return false
    }

    if ((formData.price || 0) <= 0 && productType === "standard") {
      addToast({
        title: "Validation Error",
        description: "Price must be greater than zero",
        type: "error",
      })
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
        return false
      }
    }

    // Game points validation
    if (productType === "game_points") {
      if ((formData.points_amount || 0) <= 0) {
        addToast({
          title: "Validation Error",
          description: "Points amount must be greater than zero",
          type: "error",
        })
        return false
      }

      if (!formData.game_service) {
        addToast({
          title: "Validation Error",
          description: "Please select a game service",
          type: "error",
        })
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
        ...formData,
        is_gift_card: productType === "gift_card",
        is_subscription: productType === "streaming",
      }

      let newProductId = productId

      if (productId) {
        // Update existing product
        await productService.updateProduct(productId, productData, imageFile || undefined)
      } else {
        // Create new product
        newProductId = await productService.createProduct(productData, imageFile || undefined)
      }

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

  return {
    formData,
    setFormData,
    productType,
    isLoading,
    isSubmitting,
    error,
    imageFile,
    imagePreview,
    categories,
    parentCategories,
    subcategories,
    selectedParentCategory,
    plans,
    setPlans,
    denominations,
    setDenominations,
    licenseTypes,
    setLicenseTypes,
    editions,
    setEditions,
    handleProductTypeChange,
    handleInputChange,
    handleCheckboxChange,
    handleImageChange,
    handleParentCategoryChange,
    handleSubmit,
    setError,
  }
}
