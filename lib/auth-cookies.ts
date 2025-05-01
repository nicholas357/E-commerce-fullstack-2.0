/**
 * Auth cookie utilities for consistent cookie handling across client and server
 */

// Cookie name for storing auth state
export const AUTH_COOKIE_NAME = "turgame-auth-session"

// Cookie options
export const getCookieOptions = (isProd = process.env.NODE_ENV === "production") => ({
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  sameSite: "lax" as const,
  secure: isProd,
  httpOnly: false, // Must be false to be accessible by client JS
})

// Parse cookies from string
export function parseCookies(cookieString = ""): Record<string, string> {
  return cookieString.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=")
      if (key) acc[key.trim()] = decodeURIComponent(value || "")
      return acc
    },
    {} as Record<string, string>,
  )
}

// Set auth cookie with user data
export function setAuthCookie(userData: any) {
  if (typeof window === "undefined") return false

  try {
    // Serialize user data to JSON string
    const userJson = JSON.stringify(userData)
    const encodedData = encodeURIComponent(userJson)

    // Get cookie options
    const options = getCookieOptions()

    // Build cookie string
    const cookieValue = `${AUTH_COOKIE_NAME}=${encodedData}; path=${options.path}; max-age=${options.maxAge}; samesite=${options.sameSite}${options.secure ? "; secure" : ""}`

    // Set cookie
    document.cookie = cookieValue

    console.log("[Auth Cookies] Auth cookie set successfully")
    return true
  } catch (err) {
    console.error("[Auth Cookies] Error setting auth cookie:", err)
    return false
  }
}

// Get auth data from cookie
export function getAuthFromCookie(): any | null {
  if (typeof window === "undefined") return null

  try {
    const cookies = parseCookies(document.cookie)
    const authCookie = cookies[AUTH_COOKIE_NAME]

    if (!authCookie) return null

    // Parse JSON data
    return JSON.parse(decodeURIComponent(authCookie))
  } catch (err) {
    console.error("[Auth Cookies] Error getting auth from cookie:", err)
    return null
  }
}

// Clear auth cookie
export function clearAuthCookie() {
  if (typeof window === "undefined") return false

  try {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=-1`
    console.log("[Auth Cookies] Auth cookie cleared")
    return true
  } catch (err) {
    console.error("[Auth Cookies] Error clearing auth cookie:", err)
    return false
  }
}

// Server-side function to get auth data from request cookies
export function getAuthFromRequestCookies(cookieHeader: string | null): any | null {
  if (!cookieHeader) return null

  try {
    const cookies = parseCookies(cookieHeader)
    const authCookie = cookies[AUTH_COOKIE_NAME]

    if (!authCookie) return null

    // Parse JSON data
    return JSON.parse(decodeURIComponent(authCookie))
  } catch (err) {
    console.error("[Auth Cookies] Error getting auth from request cookies:", err)
    return null
  }
}
