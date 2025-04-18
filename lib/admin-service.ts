"use client"

import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export const adminService = {
  // Check if the current user is an admin
  isAdmin: async (): Promise<boolean> => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return false

      const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (error || !data) {
        console.error("Error checking admin status:", error)
        return false
      }

      return data.role === "admin"
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  },

  // Get all orders with related data
  getAllOrders: async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*),
          payment_proof:payment_proofs(*)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: `Failed to fetch orders: ${error.message}`,
          variant: "destructive",
        })
        return []
      }

      return data
    } catch (error: any) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return []
    }
  },

  // Get order by ID with all related data
  getOrderById: async (orderId: string) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*),
          payment_proof:payment_proofs(*),
          shipping_address:shipping_addresses!orders_shipping_address_id_fkey(*)
        `)
        .eq("id", orderId)
        .single()

      if (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: `Failed to fetch order: ${error.message}`,
          variant: "destructive",
        })
        return null
      }

      // Get user information
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", data.user_id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
      }

      return {
        ...data,
        user: userData || { id: data.user_id, full_name: "Unknown", email: "unknown@example.com" },
      }
    } catch (error: any) {
      console.error("Error fetching order:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return null
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating order status:", error)
        toast({
          title: "Error",
          description: `Failed to update order status: ${error.message}`,
          variant: "destructive",
        })
        return false
      }

      return true
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  },

  // Update payment status
  updatePaymentStatus: async (orderId: string, paymentStatus: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) {
        console.error("Error updating payment status:", error)
        toast({
          title: "Error",
          description: `Failed to update payment status: ${error.message}`,
          variant: "destructive",
        })
        return false
      }

      return true
    } catch (error: any) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  },

  // Verify payment proof
  verifyPaymentProof: async (proofId: string, verified: boolean) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("payment_proofs")
        .update({
          verified,
          verified_at: new Date().toISOString(),
        })
        .eq("id", proofId)

      if (error) {
        console.error("Error verifying payment proof:", error)
        toast({
          title: "Error",
          description: `Failed to verify payment proof: ${error.message}`,
          variant: "destructive",
        })
        return false
      }

      return true
    } catch (error: any) {
      console.error("Error verifying payment proof:", error)
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      })
      return false
    }
  },

  // Delete an order
  deleteOrder: async (orderId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createClient()

      // First delete related records (payment proofs, order items)
      // Delete payment proofs
      const { error: paymentProofError } = await supabase.from("payment_proofs").delete().eq("order_id", orderId)

      if (paymentProofError) {
        console.error("Error deleting payment proofs:", paymentProofError)
        // Continue anyway, we'll try to delete the order
      }

      // Delete order items
      const { error: orderItemsError } = await supabase.from("order_items").delete().eq("order_id", orderId)

      if (orderItemsError) {
        console.error("Error deleting order items:", orderItemsError)
        // Continue anyway, we'll try to delete the order
      }

      // Finally delete the order
      const { error } = await supabase.from("orders").delete().eq("id", orderId)

      if (error) {
        console.error("Error deleting order:", error)
        return { success: false, error: "Failed to delete order" }
      }

      return { success: true }
    } catch (error) {
      console.error("Error deleting order:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  },
}
