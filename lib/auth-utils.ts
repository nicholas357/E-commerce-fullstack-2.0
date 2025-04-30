/**
 * Utility functions for authentication
 */

// Check if we're in a potential redirect loop
export function detectRedirectLoop() {
  if (typeof window === "undefined") return false

  // Check URL for redirect parameter
  const url = new URL(window.location.href)
  const redirectTo = url.searchParams.get("redirectTo")
  const isLoginPage = window.location.pathname.includes("/account/login")

  // Check session storage for redirect count
  const redirectCount = Number.parseInt(sessionStorage.getItem("auth_redirect_count") || "0")

  // Increment redirect count if we're on login page with redirectTo
  if (isLoginPage && redirectTo) {
    sessionStorage.setItem("auth_redirect_count", (redirectCount + 1).toString())

    // If we've redirected more than 3 times, we're probably in a loop
    if (redirectCount >= 3) {
      console.warn("[Auth Utils] Detected potential redirect loop")
      return true
    }
  } else {
    // Reset redirect count if we're not on login page with redirectTo
    sessionStorage.removeItem("auth_redirect_count")
  }

  return false
}

// Break a redirect loop by forcing navigation
export function breakRedirectLoop(fallbackPath = "/account") {
  if (typeof window === "undefined") return

  console.log("[Auth Utils] Breaking redirect loop")

  // Clear redirect count
  sessionStorage.removeItem("auth_redirect_count")

  // Get redirect path from URL or use fallback
  const url = new URL(window.location.href)
  const redirectTo = url.searchParams.get("redirectTo") || fallbackPath

  // Force navigation
  window.location.href = redirectTo
}

// Reset auth state completely
export async function resetAuthState() {
  if (typeof window === "undefined") return

  console.log("[Auth Utils] Resetting auth state")

  // Clear all auth-related storage
  localStorage.removeItem("supabase.auth.token")
  localStorage.removeItem("sb-auth-token")
  sessionStorage.removeItem("auth_redirect_count")

  // Clear cookies
  document.cookie = "sb-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  document.cookie = "sb-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

  // Reload the page to ensure clean state
  window.location.reload()
}
