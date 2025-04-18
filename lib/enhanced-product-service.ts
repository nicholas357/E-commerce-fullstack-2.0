"use client"

import { getSupabaseClient } from "@/lib/supabase/client-client"
import type { Product, StreamingPlan } from "@/types/product"

class ProductService {
  async getProducts(): Promise<Product[]> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching products:", error)
      return []
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error) throw error

      // Fetch related data based on product type
      if (data.is_gift_card) {
        const { data: denominations } = await supabase.from("gift_card_denominations").select("*").eq("product_id", id)
        data.denominations = denominations || []
      }

      if (data.is_software) {
        const { data: licenses } = await supabase.from("software_licenses").select("*").eq("product_id", id)
        data.license_types = licenses || []
      }

      // Fetch game editions for standard products
      const { data: editions } = await supabase.from("game_editions").select("*").eq("product_id", id)

      if (editions && editions.length > 0) {
        data.editions = editions
      }

      return data
    } catch (error) {
      console.error("Error fetching product:", error)
      return null
    }
  }

  async getStreamingPlans(productId: string): Promise<StreamingPlan[]> {
    try {
      const supabase = getSupabaseClient()
      const { data: plans, error } = await supabase.from("streaming_plans").select("*").eq("product_id", productId)

      if (error) throw error

      // Fetch durations for each plan
      const plansWithDurations = await Promise.all(
        plans.map(async (plan) => {
          const { data: durations } = await supabase.from("streaming_durations").select("*").eq("plan_id", plan.id)

          return {
            ...plan,
            durations: durations || [],
          }
        }),
      )

      return plansWithDurations
    } catch (error) {
      console.error("Error fetching streaming plans:", error)
      return []
    }
  }

  async saveStreamingPlans(productId: string, plans: StreamingPlan[]): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      // First, delete existing plans and durations
      const { data: existingPlans } = await supabase.from("streaming_plans").select("id").eq("product_id", productId)

      if (existingPlans && existingPlans.length > 0) {
        const planIds = existingPlans.map((p) => p.id)

        // Delete durations for these plans
        await supabase.from("streaming_durations").delete().in("plan_id", planIds)

        // Delete the plans
        await supabase.from("streaming_plans").delete().eq("product_id", productId)
      }

      // Now insert new plans and durations
      for (const plan of plans) {
        const { data: newPlan, error: planError } = await supabase
          .from("streaming_plans")
          .insert({
            product_id: productId,
            plan_id: plan.plan_id,
            name: plan.name,
            screens: plan.screens,
            quality: plan.quality,
            description: plan.description,
          })
          .select("id")
          .single()

        if (planError) throw planError

        // Insert durations for this plan
        if (plan.durations && plan.durations.length > 0) {
          const durationsToInsert = plan.durations.map((d) => ({
            plan_id: newPlan.id,
            duration_id: d.duration_id,
            name: d.name,
            months: d.months,
            price: d.price,
            discount: d.discount,
          }))

          const { error: durationsError } = await supabase.from("streaming_durations").insert(durationsToInsert)

          if (durationsError) throw durationsError
        }
      }
    } catch (error) {
      console.error("Error saving streaming plans:", error)
      throw error
    }
  }

  // Client-side methods that don't directly modify the database
  // These will call server actions for actual database operations
  async createProduct(productData: Partial<Product>, imageFile?: File): Promise<string> {
    try {
      // The actual database operation is handled by the server action
      // This is just a wrapper for client components
      return "temp-id" // This will be replaced by the server action
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  async updateProduct(id: string, productData: Partial<Product>, imageFile?: File): Promise<void> {
    try {
      // The actual database operation is handled by the server action
      // This is just a wrapper for client components
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.from("products").delete().eq("id", id)
      if (error) throw error
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }
}

export const productService = new ProductService()
