"use client"

import { createClient } from "@/lib/supabase/client"

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: string
  display_order: number
  is_active: boolean
  created_at: Date
  updated_at?: Date
  icon?: string
  show_in_navbar: boolean
}

// Import the Product type from product-service
import type { Product } from "@/lib/product-service"

// Define the fixed parent categories that cannot be deleted or modified
export const FIXED_PARENT_CATEGORIES = ["games", "gift-cards", "streaming-services", "software", "game-points"]

// Cache for categories to avoid repeated fetches
let categoriesCache: Category[] | null = null

// Fallback categories in case of database errors
const fallbackCategories = [
  { id: "games", name: "Games", slug: "games" },
  { id: "gift-cards", name: "Gift Cards", slug: "gift-cards" },
  { id: "streaming", name: "Streaming Services", slug: "streaming-services" },
  { id: "software", name: "Software", slug: "software" },
  { id: "game-points", name: "Game Points", slug: "game-points" },
]

export const categoryService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    // Return from cache if available
    if (categoriesCache) {
      return categoriesCache
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("categories").select("*").order("display_order", { ascending: true })

      if (error) {
        console.error("Error getting categories:", error)
        // Return fallback categories if there's an error
        return fallbackCategories as any[]
      }

      if (!data || data.length === 0) {
        console.warn("No categories found, using fallbacks")
        return fallbackCategories as any[]
      }

      const categories = data.map((category) => ({
        ...category,
        created_at: new Date(category.created_at),
        updated_at: category.updated_at ? new Date(category.updated_at) : undefined,
      })) as Category[]

      // Cache the categories
      categoriesCache = categories

      return categories
    } catch (error) {
      console.error("Error getting categories:", error)
      return fallbackCategories as any[]
    }
  },

  // Get parent categories (for dropdown selection)
  getParentCategories: async (): Promise<Category[]> => {
    const categories = await categoryService.getCategories()
    // Filter to only include parent categories (those with no parent_id)
    return categories.filter((category) => !category.parent_id)
  },

  // Get subcategories for a specific parent category
  getSubcategories: async (parentId: string): Promise<Category[]> => {
    if (!parentId) return []

    try {
      // Try to get all categories first (this will populate the cache)
      const allCategories = await categoryService.getCategories()

      // Filter to only include subcategories of the specified parent
      return allCategories.filter((category) => category.parent_id === parentId)
    } catch (error) {
      console.error("Error getting subcategories:", error)
      return []
    }
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category | null> => {
    if (!id) return null

    // Check cache first
    if (categoriesCache) {
      const category = categoriesCache.find((c) => c.id === id)
      if (category) return category
    }

    // Check if it's one of our fallback categories
    const fallbackCategory = fallbackCategories.find((c) => c.id === id)
    if (fallbackCategory) {
      return {
        ...fallbackCategory,
        display_order: 0,
        is_active: true,
        created_at: new Date(),
        show_in_navbar: true,
      } as Category
    }

    try {
      // Try to get all categories first (this will populate the cache)
      if (!categoriesCache) {
        await categoryService.getCategories()

        // Check cache again after populating
        if (categoriesCache) {
          const category = categoriesCache.find((c) => c.id === id)
          if (category) return category
        }
      }

      // If still not found, try direct query
      const supabase = createClient()
      const { data, error } = await supabase.from("categories").select("*").eq("id", id).limit(1) // Limit to 1 result to avoid multiple rows

      if (error) {
        console.error("Error getting category:", error)
        return null
      }

      // If no data or empty array, return null
      if (!data || data.length === 0) {
        return null
      }

      // Take the first result
      const category = data[0]

      return {
        ...category,
        created_at: new Date(category.created_at),
        updated_at: category.updated_at ? new Date(category.updated_at) : undefined,
      } as Category
    } catch (error) {
      console.error("Error getting category:", error)
      return null
    }
  },

  // Get products by category ID - ADDING THIS MISSING FUNCTION
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    if (!categoryId) return []

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting products by category:", error)
        return []
      }

      if (!data || data.length === 0) {
        return []
      }

      // Transform the data to match the Product type
      return data.map((product) => ({
        ...product,
        created_at: new Date(product.created_at),
        updated_at: product.updated_at ? new Date(product.updated_at) : undefined,
      })) as Product[]
    } catch (error) {
      console.error("Error getting products by category:", error)
      return []
    }
  },

  // Get category name by ID (convenience method)
  getCategoryName: async (id: string): Promise<string> => {
    // Check if id is valid
    if (!id) return "Unknown Category"

    // Check if it's a UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // If it's not a UUID, it might already be a name
    if (!isUUID) return id

    // Check fallback categories
    const fallbackCategory = fallbackCategories.find((c) => c.id === id)
    if (fallbackCategory) {
      return fallbackCategory.name
    }

    // Check cache first
    if (categoriesCache) {
      const category = categoriesCache.find((c) => c.id === id)
      if (category) return category.name
    }

    try {
      // Try to get all categories first to populate cache
      if (!categoriesCache) {
        await categoryService.getCategories()

        // Check cache again after populating
        if (categoriesCache) {
          const category = categoriesCache.find((c) => c.id === id)
          if (category) return category.name
        }
      }

      // If still not found, try direct query
      const category = await categoryService.getCategoryById(id)
      return category ? category.name : "Unknown Category"
    } catch (error) {
      console.error("Error getting category name:", error)
      return "Unknown Category"
    }
  },

  // Create a new category
  createCategory: async (
    categoryData: Omit<Category, "id" | "created_at" | "updated_at">,
    imageFile?: File,
  ): Promise<Category> => {
    try {
      const supabase = createClient()

      // Handle image upload if provided
      let imagePath = null
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `category-images/${fileName}`

        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, imageFile)

        if (uploadError) {
          console.error("Error uploading image:", uploadError)
          throw new Error("Failed to upload image")
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath)

        imagePath = publicUrl
      }

      // Insert category data
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            ...categoryData,
            image: imagePath,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .limit(1)

      if (error) {
        console.error("Error creating category:", error)
        throw new Error(error.message)
      }

      if (!data || data.length === 0) {
        throw new Error("Failed to create category")
      }

      // Clear cache
      categoryService.clearCache()

      return {
        ...data[0],
        created_at: new Date(data[0].created_at),
      } as Category
    } catch (error: any) {
      console.error("Error creating category:", error)
      throw new Error(error.message || "Failed to create category")
    }
  },

  // Update an existing category
  updateCategory: async (
    id: string,
    categoryData: Partial<Omit<Category, "id" | "created_at" | "updated_at">>,
    imageFile?: File,
  ): Promise<Category> => {
    try {
      const supabase = createClient()

      // Handle image upload if provided
      let imagePath = categoryData.image
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `category-images/${fileName}`

        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, imageFile)

        if (uploadError) {
          console.error("Error uploading image:", uploadError)
          throw new Error("Failed to upload image")
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath)

        imagePath = publicUrl
      }

      // Update category data
      const { data, error } = await supabase
        .from("categories")
        .update({
          ...categoryData,
          image: imagePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .limit(1)

      if (error) {
        console.error("Error updating category:", error)
        throw new Error(error.message)
      }

      if (!data || data.length === 0) {
        throw new Error("Failed to update category")
      }

      // Clear cache
      categoryService.clearCache()

      return {
        ...data[0],
        created_at: new Date(data[0].created_at),
        updated_at: data[0].updated_at ? new Date(data[0].updated_at) : undefined,
      } as Category
    } catch (error: any) {
      console.error("Error updating category:", error)
      throw new Error(error.message || "Failed to update category")
    }
  },

  // Delete a category
  deleteCategory: async (id: string): Promise<void> => {
    try {
      // Check if this is a fixed parent category
      const category = await categoryService.getCategoryById(id)
      if (category && category.parent_id === null && FIXED_PARENT_CATEGORIES.includes(category.slug)) {
        throw new Error("Cannot delete a fixed parent category")
      }

      const supabase = createClient()
      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) {
        console.error("Error deleting category:", error)
        throw new Error(error.message)
      }

      // Clear cache
      categoryService.clearCache()
    } catch (error: any) {
      console.error("Error deleting category:", error)
      throw new Error(error.message || "Failed to delete category")
    }
  },

  // Clear cache (useful when categories are updated)
  clearCache: () => {
    categoriesCache = null
  },
}
