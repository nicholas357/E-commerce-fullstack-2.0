import { getSupabaseClient } from "./supabase-client"

export async function handleDeleteUser(userId: string) {
  try {
    const supabase = getSupabaseClient()

    // First, delete related records from dependent tables to avoid foreign key constraint violations
    // 1. Delete shipping addresses
    const { error: shippingError } = await supabase.from("shipping_addresses").delete().eq("user_id", userId)

    if (shippingError) {
      console.error("Error deleting shipping addresses:", shippingError)
      // Continue with other deletions even if this fails
    }

    // 2. Delete payment methods
    const { error: paymentError } = await supabase.from("payment_methods").delete().eq("user_id", userId)

    if (paymentError) {
      console.error("Error deleting payment methods:", paymentError)
      // Continue with other deletions even if this fails
    }

    // 3. Delete orders (or update them to remove user reference)
    const { error: ordersError } = await supabase.from("orders").delete().eq("user_id", userId)

    if (ordersError) {
      console.error("Error deleting orders:", ordersError)
      // Continue with other deletions even if this fails
    }

    // 4. Delete user profile from profiles table
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

    if (profileError) {
      console.error("Error deleting profile:", profileError)
      throw new Error(`Failed to delete user profile: ${profileError.message}`)
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in handleDeleteUser:", error)
    return {
      success: false,
      error: error.message || "Failed to delete user",
    }
  }
}
