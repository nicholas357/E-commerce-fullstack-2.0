"use client"

import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/product-service"

export type PaymentMethod = "credit_card" | "esewa" | "khalti" | "connectips" | "bank_transfer" | "cash_on_delivery"

export type OrderStatus =
  | "pending"
  | "payment_verification"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"

export type PaymentStatus =
  | "pending"
  | "verification_required"
  | "verification_submitted"
  | "verified"
  | "failed"
  | "refunded"

export type ProductType = "gift_card" | "game_points" | "xbox_game" | "streaming_service" | "software"

export interface ShippingAddress {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code?: string
  country: string
  is_default: boolean
  created_at: string
  updated_at?: string
}

export interface PromoCode {
  id: string
  code: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  starts_at: string
  expires_at: string
  usage_limit?: number
  usage_count: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_type: ProductType
  quantity: number
  unit_price: number
  subtotal: number
  code?: string
  activation_instructions?: string
  plan_id?: string
  duration_id?: string
  subscription_start?: string
  subscription_end?: string
  is_delivered: boolean
  delivered_at?: string
  created_at: string
  updated_at?: string
  product?: Product
}

export interface PaymentProof {
  id: string
  order_id: string
  file_url: string
  payment_method: string
  transaction_id?: string
  amount: number
  uploaded_at: string
  notes?: string
  verified: boolean
  verified_at?: string
  verified_by?: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  subtotal: number
  shipping_fee: number
  tax: number
  discount: number
  total: number
  promo_code_id?: string
  shipping_address_id?: string
  billing_address_id?: string
  notes?: string
  admin_notes?: string
  created_at: string
  updated_at?: string
  items?: OrderItem[]
  payment_proof?: PaymentProof
  shipping_address?: ShippingAddress
  billing_address?: ShippingAddress
  promo_code?: PromoCode
  user?: {
    id: string
    full_name: string | null
    email: string | null
  }
}

export interface CheckoutData {
  items: {
    product_id: string
    product_name: string
    product_type: ProductType
    quantity: number
    unit_price: number
    subtotal: number
    plan_id?: string
    duration_id?: string
  }[]
  shipping_address_id?: string
  billing_address_id?: string
  payment_method: PaymentMethod
  promo_code?: string
  notes?: string
  shipping_details?: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    notes: string
  }
}

export const orderService = {
  // Get all orders
  getOrders: async (): Promise<Order[]> => {
    try {
      const supabase = createClient()

      // Get orders with related data, specifying the foreign key for each relationship
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
        *,
        items:order_items(*),
        payment_proof:payment_proofs(*),
        shipping_address:shipping_addresses!orders_shipping_address_id_fkey(*),
        billing_address:shipping_addresses!orders_billing_address_id_fkey(*)
      `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting orders:", error)
        return []
      }

      // Get user information for each order
      const ordersWithUsers = await Promise.all(
        orders.map(async (order) => {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", order.user_id)
            .single()

          if (userError) {
            console.error("Error getting user data:", userError)
            return {
              ...order,
              user: {
                id: order.user_id,
                full_name: "Unknown",
                email: "unknown@example.com",
              },
            }
          }

          return {
            ...order,
            user: userData,
          }
        }),
      )

      return ordersWithUsers as Order[]
    } catch (error) {
      console.error("Error getting orders:", error)
      return []
    }
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order | null> => {
    try {
      const supabase = createClient()

      // Get the order with related data, specifying the foreign key for each relationship
      const { data: order, error } = await supabase
        .from("orders")
        .select(`
        *,
        items:order_items(*),
        payment_proof:payment_proofs(*),
        shipping_address:shipping_addresses!orders_shipping_address_id_fkey(*),
        billing_address:shipping_addresses!orders_billing_address_id_fkey(*),
        promo_code:promo_codes(*)
      `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error getting order:", error)
        return null
      }

      // Get the user information
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", order.user_id)
        .single()

      if (userError) {
        console.error("Error getting user data:", userError)
        return {
          ...order,
          user: {
            id: order.user_id,
            full_name: "Unknown",
            email: "unknown@example.com",
          },
        }
      }

      return {
        ...order,
        user: userData,
      } as Order
    } catch (error) {
      console.error("Error getting order:", error)
      return null
    }
  },

  // Update order status
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<void> => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        console.error("Error updating order status:", error)
        throw error
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      throw error
    }
  },

  // Update payment status
  updatePaymentStatus: async (id: string, paymentStatus: PaymentStatus): Promise<void> => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        console.error("Error updating payment status:", error)
        throw error
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  },

  // Verify payment proof
  verifyPaymentProof: async (proofId: string, verified: boolean, notes?: string): Promise<void> => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("payment_proofs")
        .update({
          verified,
          verified_at: new Date().toISOString(),
          notes,
        })
        .eq("id", proofId)

      if (error) {
        console.error("Error verifying payment proof:", error)
        throw error
      }

      // Get the order ID for this payment proof
      const { data: proofData } = await supabase.from("payment_proofs").select("order_id").eq("id", proofId).single()

      if (proofData) {
        // Update the order's payment status
        const newPaymentStatus: PaymentStatus = verified ? "verified" : "failed"
        const newOrderStatus: OrderStatus = verified ? "processing" : "pending"

        await supabase
          .from("orders")
          .update({
            payment_status: newPaymentStatus,
            status: newOrderStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", proofData.order_id)
      }
    } catch (error) {
      console.error("Error verifying payment proof:", error)
      throw error
    }
  },

  // Add admin notes to an order
  addAdminNotes: async (id: string, notes: string): Promise<void> => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("orders")
        .update({ admin_notes: notes, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) {
        console.error("Error adding admin notes:", error)
        throw error
      }
    } catch (error) {
      console.error("Error adding admin notes:", error)
      throw error
    }
  },

  // Get orders by user ID
  getOrdersByUserId: async (userId: string): Promise<Order[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select(`
        *,
        items:order_items(*),
        payment_proof:payment_proofs(*),
        shipping_address:shipping_addresses!orders_shipping_address_id_fkey(*),
        billing_address:shipping_addresses!orders_billing_address_id_fkey(*)
      `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting user orders:", error)
        return []
      }

      return data as Order[]
    } catch (error) {
      console.error("Error getting user orders:", error)
      return []
    }
  },

  // Get recent orders (for dashboard)
  getRecentOrders: async (limit = 5): Promise<Order[]> => {
    try {
      const supabase = createClient()

      // Get recent orders with their items
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
        *,
        items:order_items(*),
        shipping_address:shipping_addresses!orders_shipping_address_id_fkey(*)
      `)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error getting recent orders:", error)
        return []
      }

      // Get user information for each order
      const ordersWithUsers = await Promise.all(
        orders.map(async (order) => {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", order.user_id)
            .single()

          if (userError) {
            console.error("Error getting user data:", userError)
            return {
              ...order,
              user: {
                id: order.user_id,
                full_name: "Unknown",
                email: "unknown@example.com",
              },
            }
          }

          return {
            ...order,
            user: userData,
          }
        }),
      )

      return ordersWithUsers as Order[]
    } catch (error) {
      console.error("Error getting recent orders:", error)
      return []
    }
  },

  // Get order statistics
  getOrderStatistics: async (): Promise<{
    total: number
    pending: number
    processing: number
    completed: number
    cancelled: number
  }> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("orders").select("status")

      if (error) {
        console.error("Error getting order statistics:", error)
        return { total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 }
      }

      const total = data.length
      const pending = data.filter(
        (order) => order.status === "pending" || order.status === "payment_verification",
      ).length
      const processing = data.filter((order) => order.status === "processing" || order.status === "shipped").length
      const completed = data.filter((order) => order.status === "delivered" || order.status === "completed").length
      const cancelled = data.filter((order) => order.status === "cancelled" || order.status === "refunded").length

      return { total, pending, processing, completed, cancelled }
    } catch (error) {
      console.error("Error getting order statistics:", error)
      return { total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 }
    }
  },

  // Create a new order
  createOrder: async (checkoutData: CheckoutData): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      const supabase = createClient()
      const userId = (await supabase.auth.getUser()).data.user?.id

      if (!userId) {
        return { success: false, error: "User not authenticated" }
      }

      // Create shipping address if provided
      let shippingAddressId = checkoutData.shipping_address_id
      if (!shippingAddressId && checkoutData.shipping_details) {
        // Check if shipping_addresses table exists, if not create it
        const { error: tableCheckError } = await supabase.from("shipping_addresses").select("id").limit(1)

        if (tableCheckError && tableCheckError.message.includes('relation "shipping_addresses" does not exist')) {
          // Create the table
          const { error: createTableError } = await supabase.rpc("create_shipping_addresses_table")
          if (createTableError) {
            console.error("Error creating shipping_addresses table:", createTableError)
            // Continue anyway, we'll use null for the shipping address
          }
        }

        // Create the shipping address
        const { data: addressData, error: addressError } = await supabase
          .from("shipping_addresses")
          .insert({
            user_id: userId,
            full_name: checkoutData.shipping_details.fullName,
            phone: checkoutData.shipping_details.phone,
            address_line1: checkoutData.shipping_details.address,
            city: checkoutData.shipping_details.city,
            country: "Nepal", // Default
            is_default: true,
          })
          .select("id")
          .single()

        if (!addressError && addressData) {
          shippingAddressId = addressData.id
        }
      }

      // Calculate totals
      const subtotal = checkoutData.items.reduce((sum, item) => sum + item.subtotal, 0)
      let discount = 0
      let promoCodeId = null

      // Apply promo code if provided
      if (checkoutData.promo_code) {
        const { data: promoCode, error: promoError } = await supabase
          .from("promo_codes")
          .select("*")
          .eq("code", checkoutData.promo_code)
          .eq("is_active", true)
          .single()

        if (promoError) {
          console.error("Error getting promo code:", promoError)
        } else if (promoCode) {
          // Check if promo code is valid
          const now = new Date()
          const startsAt = new Date(promoCode.starts_at)
          const expiresAt = new Date(promoCode.expires_at)

          if (
            now >= startsAt &&
            now <= expiresAt &&
            (!promoCode.usage_limit || promoCode.usage_count < promoCode.usage_limit) &&
            (!promoCode.min_order_amount || subtotal >= promoCode.min_order_amount)
          ) {
            // Calculate discount
            if (promoCode.discount_type === "percentage") {
              discount = Math.floor((subtotal * promoCode.discount_value) / 100)
              if (promoCode.max_discount_amount && discount > promoCode.max_discount_amount) {
                discount = promoCode.max_discount_amount
              }
            } else {
              discount = promoCode.discount_value
            }

            promoCodeId = promoCode.id
          }
        }
      }

      // Calculate total
      const total = subtotal - discount

      // Generate order number
      const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
        Math.random() * 10000,
      )
        .toString()
        .padStart(4, "0")}`

      // Check if orders table exists, if not create it
      const { error: ordersTableCheckError } = await supabase.from("orders").select("id").limit(1)

      if (ordersTableCheckError && ordersTableCheckError.message.includes('relation "orders" does not exist')) {
        // Create the orders table
        const { error: createOrdersTableError } = await supabase.rpc("create_orders_table")
        if (createOrdersTableError) {
          console.error("Error creating orders table:", createOrdersTableError)
          return { success: false, error: "Failed to create orders table" }
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: userId,
          status: "pending",
          payment_status: checkoutData.payment_method === "cash_on_delivery" ? "pending" : "verification_required",
          payment_method: checkoutData.payment_method,
          subtotal,
          shipping_fee: 0, // You can calculate shipping fee based on your business logic
          tax: 0, // You can calculate tax based on your business logic
          discount,
          total,
          promo_code_id: promoCodeId,
          shipping_address_id: shippingAddressId,
          billing_address_id: checkoutData.billing_address_id || shippingAddressId,
          notes: checkoutData.notes,
        })
        .select("id")
        .single()

      if (orderError) {
        console.error("Error creating order:", orderError)
        return { success: false, error: "Failed to create order" }
      }

      // Check if order_items table exists, if not create it
      const { error: itemsTableCheckError } = await supabase.from("order_items").select("id").limit(1)

      if (itemsTableCheckError && itemsTableCheckError.message.includes('relation "order_items" does not exist')) {
        // Create the order_items table
        const { error: createItemsTableError } = await supabase.rpc("create_order_items_table")
        if (createItemsTableError) {
          console.error("Error creating order_items table:", createItemsTableError)
          // Continue anyway, we'll try to insert
        }
      }

      // Create order items
      const orderItems = checkoutData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_type: item.product_type,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        plan_id: item.plan_id,
        duration_id: item.duration_id,
        is_delivered: false,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("Error creating order items:", itemsError)
        return { success: false, error: "Failed to create order items" }
      }

      // Update promo code usage count if used
      if (promoCodeId) {
        await supabase.rpc("increment_promo_code_usage", { promo_code_id: promoCodeId })
      }

      return { success: true, orderId: order.id }
    } catch (error) {
      console.error("Error creating order:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  // Upload payment proof
  uploadPaymentProof: async (
    orderId: string,
    fileUrl: string,
    paymentMethod: string,
    transactionId?: string,
    notes?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createClient()

      // Get order to check amount
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("total, payment_status")
        .eq("id", orderId)
        .single()

      if (orderError) {
        console.error("Error getting order:", orderError)
        return { success: false, error: "Order not found" }
      }

      // Check if payment_proofs table exists, if not create it
      const { error: proofsTableCheckError } = await supabase.from("payment_proofs").select("id").limit(1)

      if (proofsTableCheckError && proofsTableCheckError.message.includes('relation "payment_proofs" does not exist')) {
        // Create the payment_proofs table
        const { error: createProofsTableError } = await supabase.rpc("create_payment_proofs_table")
        if (createProofsTableError) {
          console.error("Error creating payment_proofs table:", createProofsTableError)
          // Continue anyway, we'll try to insert
        }
      }

      // Create payment proof
      const { error: proofError } = await supabase.from("payment_proofs").insert({
        order_id: orderId,
        file_url: fileUrl,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        amount: order.total,
        notes,
        uploaded_at: new Date().toISOString(),
        verified: false,
      })

      if (proofError) {
        console.error("Error creating payment proof:", proofError)
        return { success: false, error: "Failed to upload payment proof" }
      }

      // Update order payment status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "verification_submitted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("Error updating order payment status:", updateError)
        return { success: false, error: "Failed to update order status" }
      }

      return { success: true }
    } catch (error) {
      console.error("Error uploading payment proof:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  // Get shipping addresses by user ID
  getShippingAddresses: async (userId: string): Promise<ShippingAddress[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("shipping_addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error getting shipping addresses:", error)
        return []
      }

      return data as ShippingAddress[]
    } catch (error) {
      console.error("Error getting shipping addresses:", error)
      return []
    }
  },

  // Create shipping address
  createShippingAddress: async (
    address: Omit<ShippingAddress, "id" | "created_at" | "updated_at">,
  ): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      const supabase = createClient()

      // If this is the default address, unset other default addresses
      if (address.is_default) {
        await supabase
          .from("shipping_addresses")
          .update({ is_default: false })
          .eq("user_id", address.user_id)
          .eq("is_default", true)
      }

      // Create address
      const { data, error } = await supabase.from("shipping_addresses").insert(address).select("id").single()

      if (error) {
        console.error("Error creating shipping address:", error)
        return { success: false, error: "Failed to create shipping address" }
      }

      return { success: true, id: data.id }
    } catch (error) {
      console.error("Error creating shipping address:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  },

  // Validate promo code
  validatePromoCode: async (
    code: string,
    subtotal: number,
  ): Promise<{ valid: boolean; discount?: number; message?: string }> => {
    try {
      const supabase = createClient()
      const { data: promoCode, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error getting promo code:", error)
        return { valid: false, message: "Invalid promo code" }
      }

      // Check if promo code is valid
      const now = new Date()
      const startsAt = new Date(promoCode.starts_at)
      const expiresAt = new Date(promoCode.expires_at)

      if (now < startsAt) {
        return { valid: false, message: "Promo code is not active yet" }
      }

      if (now > expiresAt) {
        return { valid: false, message: "Promo code has expired" }
      }

      if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
        return { valid: false, message: "Promo code usage limit reached" }
      }

      if (promoCode.min_order_amount && subtotal < promoCode.min_order_amount) {
        return {
          valid: false,
          message: `Minimum order amount is NPR ${(promoCode.min_order_amount / 100).toFixed(2)}`,
        }
      }

      // Calculate discount
      let discount = 0
      if (promoCode.discount_type === "percentage") {
        discount = Math.floor((subtotal * promoCode.discount_value) / 100)
        if (promoCode.max_discount_amount && discount > promoCode.max_discount_amount) {
          discount = promoCode.max_discount_amount
        }
      } else {
        discount = promoCode.discount_value
      }

      return {
        valid: true,
        discount,
        message:
          promoCode.discount_type === "percentage"
            ? `${promoCode.discount_value}% discount applied`
            : `NPR ${(promoCode.discount_value / 100).toFixed(2)} discount applied`,
      }
    } catch (error) {
      console.error("Error validating promo code:", error)
      return { valid: false, message: "An error occurred while validating the promo code" }
    }
  },

  // Delete an order
  deleteOrder: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createClient()

      // First delete related records (payment proofs, order items)
      // Delete payment proofs
      const { error: paymentProofError } = await supabase.from("payment_proofs").delete().eq("order_id", id)

      if (paymentProofError) {
        console.error("Error deleting payment proofs:", paymentProofError)
        // Continue anyway, we'll try to delete the order
      }

      // Delete order items
      const { error: orderItemsError } = await supabase.from("order_items").delete().eq("order_id", id)

      if (orderItemsError) {
        console.error("Error deleting order items:", orderItemsError)
        // Continue anyway, we'll try to delete the order
      }

      // Finally delete the order
      const { error } = await supabase.from("orders").delete().eq("id", id)

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
