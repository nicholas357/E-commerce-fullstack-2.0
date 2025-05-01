/**
 * Auth cookie utilities for consistent cookie handling across client and server
 */

// Cookie name for storing auth state
export const AUTH_COOKIE_NAME = "turgame-auth-session"

// Extract project ref from Supabase URL
function getProjectRef(): string {
  // Try to extract from environment variable
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Extract project ref from URL (usually in format https://{project-ref}.supabase.co)
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
    if (match && match[1]) {
      return match[1]
    }
  }

  // Fallback to a default or extracted from window location
  if (typeof window !== "undefined") {
    // Try to extract from localStorage if Supabase stored it there
    const supabaseItems = Object.keys(localStorage).filter(
      (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
    )

    if (supabaseItems.length > 0) {
      // Extract project ref from the key
      const match = supabaseItems[0].match(/sb-([^-]+)-/)
      if (match && match[1]) {
        return match[1]
      }
    }
  }

  // If all else fails, return a hardcoded value based on your project
  // You should replace this with your actual project ref
  return "turgame"
}

// Get Supabase cookie name
function getSupabaseCookieName(): string {
  const projectRef = getProjectRef()
  return `sb-${projectRef}-auth-token`
}

// Cookie options
export function getCookieOptions(isProd = process.env.NODE_ENV === "production") {
  // Get the current domain
  let domain = undefined
  if (typeof window !== "undefined") {
    // Extract domain from hostname (remove port if present)
    domain = window.location.hostname
  }

  return {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax" as const,
    secure: isProd,
    httpOnly: false, // Must be false to be accessible by client JS
    domain: isProd ? domain : undefined, // Only set domain in production
  }
}

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

    // Build cookie string for our custom cookie
    let cookieValue = `${AUTH_COOKIE_NAME}=${encodedData}; path=${options.path}; max-age=${options.maxAge}; samesite=${options.sameSite}`

    if (options.secure) {
      cookieValue += "; secure"
    }

    if (options.domain) {
      cookieValue += `; domain=${options.domain}`
    }

    // Set our custom cookie
    document.cookie = cookieValue

    // Now also set the Supabase format cookie
    const supabaseCookieName = getSupabaseCookieName()

    // For Supabase cookie, we need to format the data in a way Supabase expects
    // This is a simplified version - in a real implementation, you'd need to match
    // Supabase's exact format including access_token, refresh_token, etc.
    const supabaseData = {
      user: {
        id: userData.id,
        email: userData.email,
        user_metadata: {
          full_name: userData.full_name,
        },
        app_metadata: {
          role: userData.role || "user",
        },
      },
      expires_at: userData.expiresAt
        ? new Date(userData.expiresAt).getTime() / 1000
        : Math.floor(Date.now() / 1000) + 3600,
      // These are placeholders - in a real implementation you'd use actual tokens
      access_token: "placeholder_access_token",
      refresh_token: "placeholder_refresh_token",
    }

    // Try to get the actual tokens from localStorage if they exist
    if (typeof window !== "undefined") {
      try {
        const supabaseItems = Object.keys(localStorage).filter(
          (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
        )

        if (supabaseItems.length > 0) {
          const storedData = JSON.parse(localStorage.getItem(supabaseItems[0]) || "{}")
          if (storedData.access_token) {
            supabaseData.access_token = storedData.access_token
          }
          if (storedData.refresh_token) {
            supabaseData.refresh_token = storedData.refresh_token
          }
        }
      } catch (e) {
        console.error("[Auth Cookies] Error getting tokens from localStorage:", e)
      }
    }

    const supabaseJson = JSON.stringify(supabaseData)
    const encodedSupabaseData = encodeURIComponent(supabaseJson)

    // Build cookie string for Supabase cookie
    let supabaseCookieValue = `${supabaseCookieName}=${encodedSupabaseData}; path=${options.path}; max-age=${options.maxAge}; samesite=${options.sameSite}`

    if (options.secure) {
      supabaseCookieValue += "; secure"
    }

    if (options.domain) {
      supabaseCookieValue += `; domain=${options.domain}`
    }

    // Set Supabase cookie
    document.cookie = supabaseCookieValue

    console.log("[Auth Cookies] Auth cookies set successfully", {
      customCookie: AUTH_COOKIE_NAME,
      supabaseCookie: supabaseCookieName,
      domain: options.domain,
      path: options.path,
      sameSite: options.sameSite,
      secure: options.secure,
    })

    return true
  } catch (err) {
    console.error("[Auth Cookies] Error setting auth cookies:", err)
    return false
  }
}

// Get auth data from cookie
export function getAuthFromCookie(): any | null {
  if (typeof window === "undefined") return null

  try {
    const cookies = parseCookies(document.cookie)
    const authCookie = cookies[AUTH_COOKIE_NAME]

    if (!authCookie) {
      // Try to get from Supabase cookie as fallback
      const supabaseCookieName = getSupabaseCookieName()
      const supabaseCookie = cookies[supabaseCookieName]

      if (supabaseCookie) {
        try {
          const supabaseData = JSON.parse(decodeURIComponent(supabaseCookie))
          if (supabaseData.user) {
            // Convert Supabase format to our format
            return {
              id: supabaseData.user.id,
              email: supabaseData.user.email,
              full_name: supabaseData.user.user_metadata?.full_name || "",
              role: supabaseData.user.app_metadata?.role || "user",
              expiresAt: supabaseData.expires_at ? new Date(supabaseData.expires_at * 1000).toISOString() : null,
            }
          }
        } catch (e) {
          console.error("[Auth Cookies] Error parsing Supabase cookie:", e)
        }
      }

      return null
    }

    // Parse JSON data from our custom cookie
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
    // Get the current domain for clearing
    let domain = undefined
    if (typeof window !== "undefined") {
      domain = window.location.hostname
    }

    // Clear our custom cookie
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=-1`
    if (domain) {
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=-1; domain=${domain}`
    }

    // Also clear the Supabase cookie
    const supabaseCookieName = getSupabaseCookieName()
    document.cookie = `${supabaseCookieName}=; path=/; max-age=-1`
    if (domain) {
      document.cookie = `${supabaseCookieName}=; path=/; max-age=-1; domain=${domain}`
    }

    console.log("[Auth Cookies] Auth cookies cleared")
    return true
  } catch (err) {
    console.error("[Auth Cookies] Error clearing auth cookies:", err)
    return false
  }
}

// Server-side function to get auth data from request cookies
export function getAuthFromRequestCookies(cookieHeader: string | null): any | null {
  if (!cookieHeader) return null

  try {
    const cookies = parseCookies(cookieHeader)
    const authCookie = cookies[AUTH_COOKIE_NAME]

    if (!authCookie) {
      // Try to get from Supabase cookie as fallback
      const projectRef = getProjectRef()
      const supabaseCookieName = `sb-${projectRef}-auth-token`
      const supabaseCookie = cookies[supabaseCookieName]

      if (supabaseCookie) {
        try {
          const supabaseData = JSON.parse(decodeURIComponent(supabaseCookie))
          if (supabaseData.user) {
            // Convert Supabase format to our format
            return {
              id: supabaseData.user.id,
              email: supabaseData.user.email,
              full_name: supabaseData.user.user_metadata?.full_name || "",
              role: supabaseData.user.app_metadata?.role || "user",
              expiresAt: supabaseData.expires_at ? new Date(supabaseData.expires_at * 1000).toISOString() : null,
            }
          }
        } catch (e) {
          console.error("[Auth Cookies] Error parsing Supabase cookie:", e)
        }
      }

      return null
    }

    // Parse JSON data from our custom cookie
    return JSON.parse(decodeURIComponent(authCookie))
  } catch (err) {
    console.error("[Auth Cookies] Error getting auth from request cookies:", err)
    return null
  }
}
