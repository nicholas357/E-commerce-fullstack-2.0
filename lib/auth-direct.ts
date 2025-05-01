/**
 * Direct authentication utilities that bypass the normal auth flow
 * Use these only as a last resort to fix auth issues
 */

// Import the auth cookie utilities
import { getAuthFromCookie, setAuthCookie, clearAuthCookie, AUTH_COOKIE_NAME } from "@/lib/auth-cookies"

// Function to directly check auth state from cookies
export async function directCheckAuthState() {
  try {
    console.log("[Auth Direct] Checking auth state directly")

    // Parse cookies
    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        if (key) acc[key.trim()] = decodeURIComponent(value || "")
        return acc
      },
      {} as Record<string, string>,
    )

    // Check for auth tokens
    const hasAuthToken = Boolean(
      cookies["sb-access-token"] ||
        cookies["sb-refresh-token"] ||
        cookies["sb-auth-token"] ||
        cookies[AUTH_COOKIE_NAME],
    )

    // Check localStorage
    const hasLocalStorageAuth = Boolean(
      localStorage.getItem("supabase.auth.token") || localStorage.getItem("sb-auth-token"),
    )

    // Check our custom auth cookie
    const hasCustomAuthCookie = Boolean(getAuthFromCookie())

    console.log("[Auth Direct] Auth state:", {
      hasAuthToken,
      hasLocalStorageAuth,
      hasCustomAuthCookie,
      cookies: Object.keys(cookies).filter(
        (k) => k.includes("sb-") || k.includes("supabase") || k === AUTH_COOKIE_NAME,
      ),
    })

    return {
      hasAuthToken,
      hasLocalStorageAuth,
      hasCustomAuthCookie,
    }
  } catch (err) {
    console.error("[Auth Direct] Error checking auth state:", err)
    return {
      hasAuthToken: false,
      hasLocalStorageAuth: false,
      hasCustomAuthCookie: false,
      error: String(err),
    }
  }
}

// Function to reset auth state completely
export function resetAuthState() {
  try {
    console.log("[Auth Direct] Resetting auth state")

    // Clear localStorage
    localStorage.removeItem("supabase.auth.token")
    localStorage.removeItem("sb-auth-token")

    // Clear sessionStorage
    sessionStorage.removeItem("auth_redirect_count")
    sessionStorage.removeItem("emergency_auth_bypass")

    // Clear cookies
    document.cookie = "sb-access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "sb-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "emergency_auth_bypass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "auth_redirect_count=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    // Clear our custom auth cookie
    clearAuthCookie()

    return true
  } catch (err) {
    console.error("[Auth Direct] Error resetting auth state:", err)
    return false
  }
}

// Function to force redirect with bypass
export function forceRedirectWithBypass(path: string) {
  try {
    console.log("[Auth Direct] Force redirecting with bypass to:", path)

    // Enable bypass
    enableEmergencyBypass()

    // Force navigation
    window.location.href = path

    return true
  } catch (err) {
    console.error("[Auth Direct] Error force redirecting:", err)
    return false
  }
}

// Function to enable emergency bypass mode
export function enableEmergencyBypass() {
  try {
    console.log("[Auth Direct] Enabling emergency bypass")

    // Set in sessionStorage
    sessionStorage.setItem("emergency_auth_bypass", "true")

    // Set in cookie
    document.cookie = "emergency_auth_bypass=true; path=/; max-age=300" // 5 minutes

    return true
  } catch (err) {
    console.error("[Auth Direct] Error enabling bypass:", err)
    return false
  }
}

// Function to manually set auth data
export function manuallySetAuthData(userData: any) {
  try {
    console.log("[Auth Direct] Manually setting auth data for user:", userData.id)
    return setAuthCookie(userData)
  } catch (err) {
    console.error("[Auth Direct] Error manually setting auth data:", err)
    return false
  }
}
