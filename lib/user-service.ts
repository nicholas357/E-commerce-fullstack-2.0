import { createClient } from "@/lib/supabase/client"

export async function handleDeleteUser(userId: string) {
  const supabase = createClient()

  try {
    console.log("[User Service] Deleting user:", userId)

    // First, delete related records in dependent tables to avoid foreign key constraint errors
    // 1. Delete shipping addresses
    const { error: shippingError } = await supabase.from("shipping_addresses").delete().eq("user_id", userId)

    if (shippingError) {
      console.error("[User Service] Error deleting shipping addresses:", shippingError)
      // Continue with deletion process even if there's an error
    }

    // 2. Delete payment methods
    const { error: paymentError } = await supabase.from("payment_methods").delete().eq("user_id", userId)

    if (paymentError) {
      console.error("[User Service] Error deleting payment methods:", paymentError)
      // Continue with deletion process even if there's an error
    }

    // 3. Delete orders (or update them to remove user reference)
    const { error: ordersError } = await supabase.from("orders").delete().eq("user_id", userId)

    if (ordersError) {
      console.error("[User Service] Error deleting orders:", ordersError)
      // Continue with deletion process even if there's an error
    }

    // 4. Delete user profile
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

    if (profileError) {
      console.error("[User Service] Error deleting profile:", profileError)
      throw profileError
    }

    // 5. Finally, delete the user from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("[User Service] Error deleting auth user:", authError)
      throw authError
    }

    console.log("[User Service] User deleted successfully:", userId)
    return { success: true }
  } catch (error) {
    console.error("[User Service] Error in handleDeleteUser:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred during user deletion",
    }
  }
}
