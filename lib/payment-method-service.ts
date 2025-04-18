import { createClient as createClientBrowser } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export type PaymentMethod = {
  id: string
  user_id: string
  payment_type: string
  is_default: boolean
  account_name?: string
  account_number?: string
  phone_number?: string
  created_at: string
}

export type NewPaymentMethod = Omit<PaymentMethod, "id" | "user_id" | "created_at">

// Client-side functions
export const paymentMethodService = {
  async getUserPaymentMethods(): Promise<PaymentMethod[]> {
    const supabase = createClientBrowser()

    const { data, error } = await supabase
      .from("user_payment_methods")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching payment methods:", error)
      return []
    }

    return data as PaymentMethod[]
  },

  async addPaymentMethod(paymentMethod: NewPaymentMethod): Promise<PaymentMethod | null> {
    const supabase = createClientBrowser()

    // Get the current user's ID from the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      console.error("No authenticated user found")
      return null
    }

    // If this is set as default, unset any existing defaults
    if (paymentMethod.is_default) {
      await supabase.from("user_payment_methods").update({ is_default: false }).eq("is_default", true)
    }

    // Include the user_id in the payment method data
    const paymentMethodWithUserId = {
      ...paymentMethod,
      user_id: session.user.id,
    }

    const { data, error } = await supabase
      .from("user_payment_methods")
      .insert(paymentMethodWithUserId)
      .select()
      .single()

    if (error) {
      console.error("Error adding payment method:", error)
      return null
    }

    return data as PaymentMethod
  },

  async updatePaymentMethod(id: string, paymentMethod: Partial<NewPaymentMethod>): Promise<PaymentMethod | null> {
    const supabase = createClientBrowser()

    // If this is set as default, unset any existing defaults
    if (paymentMethod.is_default) {
      await supabase.from("user_payment_methods").update({ is_default: false }).eq("is_default", true).neq("id", id)
    }

    const { data, error } = await supabase
      .from("user_payment_methods")
      .update(paymentMethod)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating payment method:", error)
      return null
    }

    return data as PaymentMethod
  },

  async deletePaymentMethod(id: string): Promise<boolean> {
    const supabase = createClientBrowser()

    const { error } = await supabase.from("user_payment_methods").delete().eq("id", id)

    if (error) {
      console.error("Error deleting payment method:", error)
      return false
    }

    return true
  },

  async setDefaultPaymentMethod(id: string): Promise<boolean> {
    const supabase = createClientBrowser()

    // First, unset any existing defaults
    await supabase.from("user_payment_methods").update({ is_default: false }).eq("is_default", true)

    // Then set the new default
    const { error } = await supabase.from("user_payment_methods").update({ is_default: true }).eq("id", id)

    if (error) {
      console.error("Error setting default payment method:", error)
      return false
    }

    return true
  },
}

// Server-side functions
export async function getUserPaymentMethodsServer(userId: string): Promise<PaymentMethod[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("user_payment_methods")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching payment methods:", error)
    return []
  }

  return data as PaymentMethod[]
}
