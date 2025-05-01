import { createClient } from "@/lib/supabase/client"

// Function to handle deleting a user
export async function handleDeleteUser(userId: string) {
  const supabase = createClient()

  try {
    console.log("[User Service] Deleting user:", userId)

    // First, delete all related records that have foreign key constraints
    // 1. Delete user's reviews
    console.log("[User Service] Deleting user reviews")
    const { error: reviewsError } = await supabase.from("reviews").delete().eq("user_id", userId)

    if (reviewsError) {
      console.error("[User Service] Error deleting user reviews:", reviewsError)
      throw reviewsError
    }

    // 2. Delete user's orders
    console.log("[User Service] Deleting user orders")
    const { error: ordersError } = await supabase.from("orders").delete().eq("user_id", userId)

    if (ordersError) {
      console.error("[User Service] Error deleting user orders:", ordersError)
      throw ordersError
    }

    // 3. Delete user's payment methods
    console.log("[User Service] Deleting user payment methods")
    const { error: paymentMethodsError } = await supabase.from("payment_methods").delete().eq("user_id", userId)

    if (paymentMethodsError) {
      console.error("[User Service] Error deleting user payment methods:", paymentMethodsError)
      throw paymentMethodsError
    }

    // 4. Delete user's wishlist items
    console.log("[User Service] Deleting user wishlist items")
    const { error: wishlistError } = await supabase.from("wishlist").delete().eq("user_id", userId)

    if (wishlistError) {
      console.error("[User Service] Error deleting user wishlist items:", wishlistError)
      throw wishlistError
    }

    // 5. Delete user's cart items
    console.log("[User Service] Deleting user cart items")
    const { error: cartError } = await supabase.from("cart").delete().eq("user_id", userId)

    if (cartError) {
      console.error("[User Service] Error deleting user cart items:", cartError)
      throw cartError
    }

    // Now delete the user's profile
    console.log("[User Service] Deleting user profile")
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

    if (profileError) {
      console.error("[User Service] Error deleting user profile:", profileError)
      throw profileError
    }

    // Finally, attempt to delete the user from auth
    console.log("[User Service] Deleting user from auth")
    // Note: This requires admin privileges and might not work in client-side code
    // You might need to use a server function or Edge function for this
    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        console.error("[User Service] Error deleting user from auth:", authError)
        // Don't throw here, as we've already deleted the profile
        console.warn("[User Service] User profile deleted but auth record may remain")
      } else {
        console.log("[User Service] User successfully deleted from auth")
      }
    } catch (authErr) {
      console.error("[User Service] Exception deleting user from auth:", authErr)
      console.warn("[User Service] User profile deleted but auth record may remain")
    }

    console.log("[User Service] User deletion completed successfully")
    return { success: true }
  } catch (error) {
    console.error("[User Service] Error deleting user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error deleting user",
    }
  }
}

// Other user service functions...
