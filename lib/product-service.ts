"use client"

import { createClient } from "@/lib/supabase/client"
import type { Product, StreamingPlan } from "@/types/product"

export const productService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting products:", error)
        return []
      }

      // Get products with review stats
      const productsWithReviews = await Promise.all(
        data.map(async (product) => {
          const stats = await getProductReviewStats(product.id)
          return {
            ...product,
            created_at: new Date(product.created_at),
            in_stock: product.stock > 0,
            is_new: isNewProduct(new Date(product.created_at)),
            rating: stats.averageRating,
            reviewCount: stats.reviewCount,
          }
        }),
      )

      return productsWithReviews as Product[]
    } catch (error) {
      console.error("Error getting products:", error)
      return []
    }
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error || !data) {
        console.error("Error getting product:", error)
        return null
      }

      // Calculate if product is new (less than 14 days old)
      const isNew = isNewProduct(new Date(data.created_at))

      // Get review stats
      const stats = await getProductReviewStats(id)

      return {
        ...data,
        created_at: new Date(data.created_at),
        in_stock: data.stock > 0,
        is_new: isNew,
        rating: stats.averageRating,
        reviewCount: stats.reviewCount,
      } as Product
    } catch (error) {
      console.error("Error getting product:", error)
      return null
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting products by category:", error)
        return []
      }

      // Get products with review stats
      const productsWithReviews = await Promise.all(
        data.map(async (product) => {
          const stats = await getProductReviewStats(product.id)
          return {
            ...product,
            created_at: new Date(product.created_at),
            in_stock: product.stock > 0,
            is_new: isNewProduct(new Date(product.created_at)),
            rating: stats.averageRating,
            reviewCount: stats.reviewCount,
          }
        }),
      )

      return productsWithReviews as Product[]
    } catch (error) {
      console.error("Error getting products by category:", error)
      return []
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8): Promise<Product[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error getting featured products:", error)
        return []
      }

      // Get products with review stats
      const productsWithReviews = await Promise.all(
        data.map(async (product) => {
          const stats = await getProductReviewStats(product.id)
          return {
            ...product,
            created_at: new Date(product.created_at),
            in_stock: product.stock > 0,
            is_new: isNewProduct(new Date(product.created_at)),
            rating: stats.averageRating,
            reviewCount: stats.reviewCount,
          }
        }),
      )

      return productsWithReviews as Product[]
    } catch (error) {
      console.error("Error getting featured products:", error)
      return []
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error searching products:", error)
        return []
      }

      // Get products with review stats
      const productsWithReviews = await Promise.all(
        data.map(async (product) => {
          const stats = await getProductReviewStats(product.id)
          return {
            ...product,
            created_at: new Date(product.created_at),
            in_stock: product.stock > 0,
            is_new: isNewProduct(new Date(product.created_at)),
            rating: stats.averageRating,
            reviewCount: stats.reviewCount,
          }
        }),
      )

      return productsWithReviews as Product[]
    } catch (error) {
      console.error("Error searching products:", error)
      return []
    }
  },

  // Get streaming plans for a product
  getStreamingPlans: async (productId: string): Promise<StreamingPlan[]> => {
    try {
      const supabase = createClient()
      const { data: plansData, error: plansError } = await supabase
        .from("streaming_plans")
        .select("*")
        .eq("product_id", productId)

      if (plansError) {
        console.error("Error getting streaming plans:", plansError)
        return []
      }

      // Get durations for each plan
      const plans: StreamingPlan[] = []

      for (const plan of plansData) {
        const { data: durationsData, error: durationsError } = await supabase
          .from("streaming_durations")
          .select("*")
          .eq("plan_id", plan.id)

        if (durationsError) {
          console.error("Error getting streaming durations:", durationsError)
          continue
        }

        plans.push({
          ...plan,
          durations: durationsData,
        })
      }

      return plans
    } catch (error) {
      console.error("Error getting streaming plans:", error)
      return []
    }
  },

  // Get game editions for a product
  getGameEditions: async (productId: string): Promise<any[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("game_editions")
        .select("*")
        .eq("product_id", productId)
        .order("price", { ascending: true })

      if (error) {
        console.error("Error getting game editions:", error)
        return []
      }

      return data
    } catch (error) {
      console.error("Error getting game editions:", error)
      return []
    }
  },

  // Get gift card denominations for a product
  getGiftCardDenominations: async (productId: string): Promise<any[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("gift_card_denominations")
        .select("*")
        .eq("product_id", productId)
        .order("value", { ascending: true })

      if (error) {
        console.error("Error getting gift card denominations:", error)
        return []
      }

      return data
    } catch (error) {
      console.error("Error getting gift card denominations:", error)
      return []
    }
  },

  // Get related products
  getRelatedProducts: async (productId: string, categoryId: string, limit = 4): Promise<Product[]> => {
    try {
      const supabase = createClient()

      // First try to get products from the same category
      let { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryId)
        .neq("id", productId)
        .limit(limit)

      if (error) {
        console.error("Error getting related products:", error)
        return []
      }

      // If we don't have enough products, get some featured products
      if (data.length < limit) {
        const { data: featuredData, error: featuredError } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .neq("id", productId)
          .neq("category", categoryId)
          .limit(limit - data.length)

        if (!featuredError && featuredData) {
          data = [...data, ...featuredData]
        }
      }

      // Get products with review stats
      const productsWithReviews = await Promise.all(
        data.map(async (product) => {
          const stats = await getProductReviewStats(product.id)
          return {
            ...product,
            created_at: new Date(product.created_at),
            in_stock: product.stock > 0,
            is_new: isNewProduct(new Date(product.created_at)),
            rating: stats.averageRating,
            reviewCount: stats.reviewCount,
          }
        }),
      )

      return productsWithReviews as Product[]
    } catch (error) {
      console.error("Error getting related products:", error)
      return []
    }
  },
}

// Helper function to determine if a product is new (less than 14 days old)
function isNewProduct(createdAt: Date): boolean {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 14
}

export async function getProductReviewStats(productId: string) {
  const supabase = createClient()

  try {
    // Get review count
    const { count, error: countError } = await supabase
      .from("product_reviews")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId)

    if (countError) throw countError

    // Get average rating
    const { data: ratingData, error: ratingError } = await supabase.rpc("get_average_product_rating", {
      p_product_id: productId,
    })

    if (ratingError) throw ratingError

    return {
      reviewCount: count || 0,
      averageRating: ratingData || 0,
    }
  } catch (error) {
    console.error("Error fetching product review stats:", error)
    return {
      reviewCount: 0,
      averageRating: 0,
    }
  }
}
