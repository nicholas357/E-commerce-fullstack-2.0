/**
 * Direct authentication solution to bypass Supabase session issues
 */

import { createClient } from "@/lib/supabase/client"

// Store the user object directly in a cookie
export function storeUserInCookie(user: any) {
  if (!user) return false

  try {
    console.log("[Direct Auth] Storing user in cookie:", user.id)

    // Create a simplified user object with only essential data
    const userForCookie = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      timestamp: new Date().getTime(),
    }

    // Store in cookie - maximum 4KB
    const cookieValue = encodeURIComponent(JSON.stringify(userForCookie))
    document.cookie = `turgame_user=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax` // 7 days

    // Also store in localStorage as backup
    localStorage.setItem("turgame_user", JSON.stringify(userForCookie))

    return true
  } catch (err) {
    console.error("[Direct Auth] Error storing user in cookie:", err)
    return false
  }
}

// Get the user from cookie
export function getUserFromCookie() {
  try {
    // First try cookie
    const cookies = document.cookie.split(";")
    const userCookie = cookies.find((c) => c.trim().startsWith("turgame_user="))

    if (userCookie) {
      const userJson = decodeURIComponent(userCookie.split("=")[1])
      return JSON.parse(userJson)
    }

    // Fallback to localStorage
    const localUser = localStorage.getItem("turgame_user")
    if (localUser) {
      return JSON.parse(localUser)
    }

    return null
  } catch (err) {
    console.error("[Direct Auth] Error getting user from cookie:", err)
    return null
  }
}

// Clear the user from cookie
export function clearUserFromCookie() {
  try {
    document.cookie = "turgame_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    localStorage.removeItem("turgame_user")
    return true
  } catch (err) {
    console.error("[Direct Auth] Error clearing user from cookie:", err)
    return false
  }
}

// Check if the user is authenticated using our direct method
export function isDirectlyAuthenticated() {
  const user = getUserFromCookie()
  return Boolean(user && user.id)
}

// Fetch user directly from Supabase and store in cookie
export async function fetchAndStoreUser() {
  try {
    const supabase = createClient()
    console.log("[Direct Auth] Fetching user directly from Supabase")

    // Try to get user from Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("[Direct Auth] Error fetching user:", error)
      return null
    }

    // Get profile info
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Create complete user object
    const completeUser = {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || "",
      avatar_url: profile?.avatar_url || "",
      role: profile?.role || "user",
    }

    // Store in cookie
    storeUserInCookie(completeUser)

    return completeUser
  } catch (err) {
    console.error("[Direct Auth] Error in fetchAndStoreUser:", err)
    return null
  }
}

// Force authentication
export async function forceAuthentication(destination = "/account") {
  try {
    // Try to fetch and store user
    const user = await fetchAndStoreUser()

    if (user) {
      console.log("[Direct Auth] Successfully authenticated, redirecting to:", destination)
      sessionStorage.setItem("authentication_forced", "true")
      window.location.href = destination
      return true
    }

    return false
  } catch (err) {
    console.error("[Direct Auth] Error in forceAuthentication:", err)
    return false
  }
}
